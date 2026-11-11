"""Optional helpers, copied into the offline guide. Never train or choose a model."""
import json
from pathlib import Path
import numpy as np


def classification_checks(y_true, probabilities, classes, texts):
    from sklearn.metrics import classification_report, confusion_matrix
    import pandas as pd
    y = np.asarray(y_true)
    p = np.asarray(probabilities)
    if p.shape != (len(y), len(classes)) or len(texts) != len(y):
        raise ValueError('Labels, probabilities, classes and texts must be aligned')
    if not np.isfinite(p).all() or np.any(p < 0) or not np.allclose(p.sum(axis=1), 1, atol=1e-4):
        raise ValueError('Expected softmax probabilities')
    pred = p.argmax(axis=1)
    report = classification_report(y, pred, labels=list(range(len(classes))),
        target_names=[str(x) for x in classes], output_dict=True, zero_division=0)
    rows = pd.DataFrame({'text':list(texts), 'true':[classes[i] for i in y],
        'predicted':[classes[i] for i in pred], 'score':p.max(axis=1)})
    return pd.DataFrame(report).T, confusion_matrix(y, pred, labels=list(range(len(classes)))), rows.loc[y != pred].sort_values('score', ascending=False)


def token_audit(tokenizer, texts, max_length):
    import pandas as pd
    # One document at a time: avoid allocating a full-corpus token matrix.
    rows = []
    for text in texts:
        ids = tokenizer(str(text), truncation=False, add_special_tokens=True)['input_ids']
        kept = tokenizer(str(text), truncation=True, max_length=max_length)['input_ids']
        rows.append({'tokens':len(ids), 'truncated':len(ids)>max_length,
            'visible_text':tokenizer.decode(kept, skip_special_tokens=False)})
    return pd.DataFrame(rows)


def blend_probabilities(arrays, method='mean', weights=None):
    values = np.asarray(arrays, dtype=float)
    if values.ndim != 3 or not len(values) or not np.isfinite(values).all() or np.any((values < 0) | (values > 1)):
        raise ValueError('Expected aligned member x row x label probabilities')
    if method == 'mean':
        return values.mean(axis=0)
    if method == 'weighted':
        w = np.asarray(weights, dtype=float)
        if w.shape != (len(values),) or not np.isfinite(w).all() or np.any(w < 0) or w.sum() <= 0:
            raise ValueError('Invalid member weights')
        return np.average(values, axis=0, weights=w)
    if method == 'logit_mean':
        v = np.clip(values, 1e-6, 1-1e-6)
        z = np.mean(np.log(v)-np.log1p(-v), axis=0)
        return 1/(1+np.exp(-z))
    raise ValueError('Supported methods: mean, weighted, logit_mean')


def predict_encoder(model_dir, prepared_texts, max_length, multilabel=False, batch_size=8):
    """Input must already match the original cleaning/column recipe."""
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    if batch_size < 1 or max_length < 1:
        raise ValueError('Positive batch_size and max_length required')
    tokenizer = AutoTokenizer.from_pretrained(str(model_dir), local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(str(model_dir), local_files_only=True)
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model.to(device).eval()
    result = []
    with torch.inference_mode():
        for start in range(0,len(prepared_texts),batch_size):
            encoded = tokenizer(list(prepared_texts[start:start+batch_size]), padding=True,
                truncation=True, max_length=max_length, return_tensors='pt').to(device)
            logits = model(**encoded).logits.float()
            p = torch.sigmoid(logits) if multilabel else torch.softmax(logits, dim=-1)
            result.append(p.cpu().numpy())
    return np.concatenate(result) if result else np.empty((0,model.config.num_labels))


def freeze_choice(path, *, candidate, classes, model_paths, recipe, source_run, weights=None, thresholds=None):
    """Explicit record; no automatic extraction of missing preprocessing state."""
    payload = dict(candidate=candidate, classes=list(classes), model_paths=[str(p) for p in model_paths],
        recipe=recipe, source_run=str(source_run), weights=weights, thresholds=thresholds)
    Path(path).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    return payload
