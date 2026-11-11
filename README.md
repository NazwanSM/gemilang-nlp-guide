# Gemilang: panduan NLP GEMASTIK

Website berbahasa Indonesia untuk klasifikasi teks dan pemodelan topik. Versi 1.3.0.

Buka situs: https://nazwansm.github.io/gemilang-nlp-guide/

## Isi

Teori, cuplikan notebook beserta nomor cell, panduan parameter, diagnosis hasil, pemilihan model, serta finalisasi output. Tema terang/gelap, pencarian, dan catatan eksperimen berjalan pada browser.

Repository ini berisi distribusi website siap tayang. Dataset, bobot model, dan notebook penuh tidak disertakan. Cuplikan source yang menjadi materi pembelajaran dibundel di data.js. Website tidak mengeksekusi training.

## Menjalankan

Buka index.html secara lokal atau kunjungi GitHub Pages. Pertahankan seluruh aset bersama. Tidak memerlukan instalasi Node/Python untuk membaca. Tautan rujukan online memerlukan internet. Ekspor catatan browser untuk backup atau pindah perangkat; catatan situs dan salinan offline disimpan terpisah.

## Pembaruan

Materi dibangun dari proyek Gemilang asli melalui website/scripts/build.py. Validasi hasil build dengan website/scripts/validate.py, kemudian salin isi website/dist ke root repository publik ini dan push ke main. GitHub Pages memakai branch main, folder root. File .nojekyll menonaktifkan pemrosesan Jekyll.

manifest.json mencatat SHA256 aset distribusi. Lisensi dependensi tersedia pada licenses/.
