(function(root){
 'use strict';
 function batch(...xs){const ns=xs.map(Number);if(xs.some(x=>x==='')||ns.length!==3||ns.some(x=>!Number.isSafeInteger(x)||x<1))throw Error('Isi tiga bilangan bulat positif.');const n=ns.reduce((a,b)=>a*b,1);if(!Number.isSafeInteger(n))throw Error('Nilai terlalu besar.');return n;}
 function metrics(matrix){
  if(!Array.isArray(matrix)||matrix.length<2||matrix.some(r=>r.length!==matrix.length||r.some(n=>!Number.isInteger(n)||n<0)))throw Error('Count harus bilangan bulat nonnegatif.');
  const total=matrix.flat().reduce((a,b)=>a+b,0),div=(a,b)=>b?a/b:0;
  const classes=matrix.map((r,i)=>{const tp=r[i],support=r.reduce((a,b)=>a+b,0),pred=matrix.reduce((a,b)=>a+b[i],0);return{precision:div(tp,pred),recall:div(tp,support),f1:div(2*tp,pred+support),support};});
  return{accuracy:div(matrix.reduce((a,r,i)=>a+r[i],0),total),macroF1:classes.reduce((a,c)=>a+c.f1,0)/classes.length,classes,total};
 }
 const required=['id','task','notebook','run','hypothesis','change','result','decision'];
 function parseLog(raw){const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.rows)||d.rows.length>10000||d.rows.some(r=>!r||required.some(k=>typeof r[k]!=='string'||r[k].length>20000)||Object.values(r).some(v=>typeof v!=='string'||v.length>20000))||new Set(d.rows.map(r=>r.id)).size!==d.rows.length)throw Error('Format log tidak valid atau versi tidak didukung.');if(d.rows.some(r=>['minutes','vram'].some(k=>r[k]!==undefined&&r[k].trim()!==''&&(!Number.isFinite(Number(r[k]))||Number(r[k])<0))))throw Error('Waktu/VRAM harus angka nonnegatif atau kosong.');if(d.checks!==undefined&&(!d.checks||Array.isArray(d.checks)||typeof d.checks!=='object'||Object.values(d.checks).some(x=>typeof x!=='boolean')))throw Error('Checklist tidak valid.');return{version:1,rows:d.rows,checks:d.checks||{}};}
 function csv(rows){const keys=[...new Set(rows.flatMap(Object.keys))];const q=v=>'"'+String(/^[\s]*[=+@-]/.test(String(v??''))?"'"+v:v??'').replaceAll('"','""')+'"';return[keys.map(q).join(','),...rows.map(r=>keys.map(k=>q(r[k])).join(','))].join('\r\n');}
 function query(s){return String(s).toLowerCase().replace(/learning rate|laju belajar/g,'lr').replace(/kehabisan memori|out of memory/g,'oom').replace(/pemanasan/g,'warmup').replace(/tema/g,'topik');}
 function search(docs,s){const terms=query(s).trim().split(/\s+/).filter(Boolean);if(!terms.length)return[];return docs.map(d=>{const hay=query([d.title,d.text,d.notebook,d.cell?'cell '+d.cell:''].join(' '));return{...d,score:terms.every(t=>hay.includes(t))?terms.reduce((a,t)=>a+(query(d.title).includes(t)?4:1),0):0};}).filter(d=>d.score).sort((a,b)=>b.score-a.score).slice(0,60);}
 const api={batch,metrics,parseLog,csv,query,search};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GuideCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
