# CV builder khusus admin

Fitur berada di `/admin/cv`. Pengunjung tidak mendapat halaman CV, tombol unduh, atau akses API CV. Pesan langsung pengguna tentang akses admin menjadi acuan; permintaan akses publik dalam spesifikasi lampiran tidak diterapkan.

## Hasil analisis

Project menggunakan Next.js 16 App Router, React 19, TypeScript, PostgreSQL/Prisma 6, NextAuth, serta komponen dan warna admin yang sudah tersedia. Proyek, pengalaman, sertifikat, dan katalog teknologi telah tersimpan di database. Profil teks serta sebagian skill sebelumnya tertulis langsung dalam komponen. Pendidikan, soft skills, bahasa, dan pengaturan CV belum memiliki sumber data bersama.

PDF referensi yang diperiksa adalah `Hanif Almahmud Lubis-Resume New.pdf`: dua halaman A4, satu kolom, latar putih, teks hitam, judul nama 18 pt, judul bagian 14 pt, isi 11 pt, garis di bawah judul bagian, serta tanggal rata kanan. Template baru mengikuti susunan tersebut, menggunakan font standar PDF Helvetica yang mendekati Arial dan tidak memerlukan pengunduhan font ketika membuat PDF. Foto bersifat opsional dan awalnya dinonaktifkan sesuai spesifikasi lampiran.

Database yang diperiksa memiliki lima proyek, empat pengalaman, dan empat sertifikat. Isinya lebih baru dan berbeda dari PDF, termasuk tanggal mulai PTDI. Email pada kode portofolio juga berbeda dari email PDF. Nilai portofolio dipertahankan; PDF menjadi acuan visual dan mengisi data CV yang sebelumnya belum tersedia. Tidak ada penggantian deskripsi, tanggal, atau proyek lama menggunakan isi PDF.

## Sumber data

| Data                                                                | Sumber bersama                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Nama, jabatan, intro singkat, ringkasan profesional, kontak, tautan | `SiteSettings.profile`, divalidasi dan diketik sebagai `PersonalProfile` |
| Pendidikan                                                          | `SiteSettings.education`, daftar terstruktur dan diurutkan terbaru       |
| Soft skills dan bahasa                                              | `SiteSettings.softSkills` dan `SiteSettings.languages`                   |
| Foto                                                                | `SiteSettings.introImageUrl`, sama dengan foto intro                     |
| Keterampilan teknis                                                 | `Technology`, dengan grup, urutan, dan pengaturan tampil                 |
| Proyek dan poin kontribusi                                          | `Project`, relasi teknologi yang sudah ada, serta `cvHighlights`         |
| Pengalaman dan tanggung jawab                                       | `Experience`, `employmentType`, serta `responsibilities`                 |
| Sertifikat                                                          | `Certificate`, termasuk bulan terbit opsional `issueDate`                |
| Pilihan foto dan konten yang dikecualikan                           | `SiteSettings.cvPreferences`                                             |

JSON hanya dipakai untuk metadata singleton dengan daftar kecil dan terbatas. Semua masukan melewati validasi server; data keluaran memakai tipe TypeScript bersama. Migrasi menambahkan kolom dan memindahkan daftar skill lama ke katalog teknologi tanpa mengganti ID atau melepas relasi proyek.

Server Components dan API memakai layanan data yang sama. Komponen publik menerima `PublicProfile` dengan kolom yang dipilih secara eksplisit. Nomor telepon, ringkasan CV, pengaturan CV, dan daftar pendidikan lengkap tidak dimasukkan ke DTO publik. Intro singkat dan ringkasan CV tetap merupakan dua bentuk teks dengan tujuan berbeda, tersimpan dalam profil yang sama.

Menghapus skill dari daftar tampilan menyembunyikannya dari bagian Skills dan CV; teknologi yang sudah terhubung dengan proyek tetap tersimpan. CV mengambil proyek yang dipublikasikan. Pengecualian konten hanya memengaruhi CV, tidak mengubah status publikasi website.

## Alur penggunaan

1. Masuk sebagai admin lalu pilih **CV**.
2. Edit profil, pendidikan, keterampilan, soft skills, bahasa, dan tata letak PDF.
3. Pada **Isi CV**, pilih pengalaman, proyek, serta sertifikat yang ingin dimasukkan. Tautan Edit membuka editor sumber data yang sudah ada.
4. Simpan perubahan. Jika memilih pratinjau atau unduh saat masih ada perubahan, tombol bertuliskan **Simpan & pratinjau** atau **Simpan & unduh PDF** dan menyimpan terlebih dahulu.
5. Pratinjau dibuat dari data terkini. Sebelum memakai ulang PDF pratinjau untuk unduhan, aplikasi memeriksa revisi data di server. Jika sumber berubah di tab lain, PDF dan pratinjau diperbarui. Revisi juga mencakup versi template, sehingga perubahan tata letak memperbarui PDF yang tersimpan pada editor yang masih terbuka. Jika revisi sama, unduhan menggunakan berkas yang sama persis. **Perbarui pratinjau** juga tersedia untuk meminta pembuatan ulang secara langsung.

Tidak ada salinan statis CV yang perlu diunggah. PDF dibuat di memori server dan tidak disimpan ke Blob atau `public/`. Nama unduhan adalah `Hanif_Almahmud_Lubis_CV.pdf`. PDF menggunakan teks yang dapat diseleksi, tautan yang aktif, ukuran A4, dan pemenggalan halaman otomatis, dengan batas **maksimal dua halaman**. PDF.js menampilkan halaman dari berkas yang sama di browser, dengan zoom serta penyesuaian lebar layar; pembuatan PDF tetap berbasis teks dan tidak menggunakan screenshot.

### Batas isi CV

- Profil profesional maksimal 600 karakter, dengan penghitung karakter di admin.
- Proyek dan pengalaman sama-sama maksimal tiga poin. Setiap poin maksimal 240 karakter, dengan penghitung jumlah poin dan panjang poin pada editor sumber.
- Jika poin CV belum diisi, proyek menggunakan deskripsi lengkap dan solusi, bukan hanya ringkasan kartu. Pengalaman menggunakan kalimat serta klausa tindakan dari deskripsi yang ada. Hasilnya hingga tiga poin sesuai informasi sumber; daftar teknologi tidak dipisahkan dan klaim tambahan tidak dibuat. Poin yang diedit sendiri tetap menjadi prioritas. Deskripsi website tidak diubah.
- Urutan bagian mengikuti referensi: profil, pendidikan, pengalaman, proyek, sertifikat, serta keterampilan. Isi mengalir otomatis mengisi halaman pertama sebelum melanjutkan ke halaman kedua. Tidak ada pemisah paksa sebelum Projects; pengaturan lama `breakBeforeProjects` diabaikan dan tidak lagi ditawarkan pada editor.
- Tautan source code per proyek dihapus dari PDF. Tautan GitHub pada kontak dan repository pada halaman proyek website tetap tersedia. Live demo tetap ditampilkan jika datanya tersedia.
- Foto ditempatkan di kiri secara absolut dengan ruang teks yang simetris. Nama, kontak, dan tautan header dipusatkan terhadap lebar halaman, sehingga foto tidak menggeser teks.
- Generator membaca jumlah halaman dari callback pagination renderer yang terdokumentasi melalui `Text.render`. Hasil melebihi dua halaman ditolak dengan status `422` dan petunjuk untuk meringkas atau mengecualikan konten. Tidak ada halaman yang dipotong atau konten terpilih yang dibuang diam-diam.
- Ukuran huruf tetap mengikuti referensi; batas halaman tidak dicapai dengan mengecilkan teks hingga sulit dibaca.

## API dan perlindungan akses

| Endpoint                       | Metode | Fungsi                                                            |
| ------------------------------ | ------ | ----------------------------------------------------------------- |
| `/api/admin/cv`                | GET    | Data editor CV dan daftar konten terkini                          |
| `/api/admin/cv`                | PUT    | Simpan metadata profil, pendidikan, skill, bahasa, dan pilihan CV |
| `/api/admin/cv/pdf`            | GET    | Hasil PDF untuk pratinjau                                         |
| `/api/admin/cv/pdf?download=1` | GET    | Hasil PDF dengan nama unduhan                                     |

Halaman dan endpoint memeriksa akun ADMIN di server. Mutasi juga memeriksa origin. Respons PDF memakai `Cache-Control: private, no-store` dan `Vary: Cookie`. Pembacaan gambar dibatasi ke foto bawaan, berkas unggahan profil yang dikelola aplikasi, serta path profil pada host Public Vercel Blob; redirect dan URL arbitrer ditolak. Gambar dibatasi ukuran dan resolusinya, lalu dikonversi ke JPEG menggunakan Sharp agar PNG, JPEG, WebP, dan frame pertama GIF dapat digunakan.

## Dependensi dan deployment

Dependensi baru: `@react-pdf/renderer` 4.9.0 untuk pembuatan dokumen dan `pdfjs-dist` 6.5.438 untuk pratinjau yang baru dimuat ketika dibutuhkan. `sharp` 0.35.5, yang sebelumnya sudah dipakai Next.js, dinyatakan sebagai dependensi langsung untuk konversi foto PDF. Generator berjalan pada runtime Node.js; tidak memakai Chromium untuk menghasilkan PDF dan tidak membutuhkan secret, CDN, atau layanan PDF eksternal. Worker pratinjau disertakan oleh bundler aplikasi.

Terapkan migrasi `20261104090000_add_cv_builder` dengan `npm run db:migrate` pada database tujuan sebelum menjalankan versi aplikasi ini. Revisi aliran halaman dan poin CV tidak membutuhkan migrasi tambahan. Kemudian jalankan `npm run build` dan deploy source terbaru. Database Preview sebaiknya tetap terpisah dari Production sebagaimana pengaturan project sebelumnya.

`npm run test:integration -- --production --grep CV` membangun aplikasi dan menguji CV menggunakan `next start` serta database sementara. Mode ini juga dapat digunakan ketika server `next dev` sedang berjalan karena keluaran build produksi dan pengembangan terpisah.

Rujukan: [React 19 compatibility](https://react-pdf.org/docs/v4/compatibility), [Node PDF API](https://react-pdf.org/docs/v4/node), [page wrapping](https://react-pdf.org/docs/v4/advanced/page-wrapping), [PDF.js rendering](https://mozilla.github.io/pdf.js/examples/).

## Peta implementasi

- `src/lib/services/content.ts`: pembacaan metadata bersama, DTO publik, dan penyimpanan atomik profil serta skill.
- `src/lib/services/cv.ts`: komposisi data CV dari record asli, pengurutan, pilihan konten, ringkasan otomatis, dan revisi data.
- `src/lib/cv-config.ts` dan `src/lib/cv-validation.ts`: batas halaman, karakter, poin, dan validasi server.
- `src/components/cv/CvDocument.tsx` dan `src/lib/cv-pdf.tsx`: template A4, pemuatan foto, pembuatan PDF, dan penolakan hasil di atas dua halaman.
- `src/components/admin/CvBuilder.tsx`, `CvPointsField.tsx`, dan `CvPreview.tsx`: editor, penghitung poin, pratinjau responsif, dan unduhan.
- `app/admin/cv` dan `app/api/admin/cv`: halaman serta endpoint khusus admin.
- Komponen intro, kontak, header, footer, skill, serta halaman publik memakai data bersama tanpa mengganti desain, navigasi, atau animasinya.
- `tests/cv.test.ts` dan `tests/cv.spec.ts`: validasi, akses admin, sinkronisasi, privasi, batas dua halaman, kesamaan berkas pratinjau/unduhan, revisi dari tab lain, tampilan mobile, serta foto WebP.

## Verifikasi

Sembilan belas tes unit dan seluruh 32 tes API/browser pada mode produksi lulus, termasuk regresi setelah penerapan batas sesi admin 15 menit tanpa aktivitas, satu jam sejak login, serta pemulihan cookie sesi dari halaman login. Tes integrasi menggunakan `next start` dan database PostgreSQL sementara yang terpisah dari database portofolio. Pengujian CV mencakup aliran halaman tanpa pemisah paksa, maksimal tiga poin, penghapusan source code per proyek, serta posisi nama dan kontak yang tetap di tengah ketika foto digunakan. Lint, TypeScript, dan build produksi berhasil; pemeriksaan konfigurasi deployment juga sudah lulus pada revisi CV sebelumnya.

Migrasi sudah diterapkan pada database project yang terhubung. Pemeriksaan sebelum/sesudah menunjukkan lima proyek, empat pengalaman, empat sertifikat, serta seluruh data dan relasi lamanya tetap utuh. Daftar skill lama sekarang berasal dari katalog teknologi bersama.

Pemeriksaan baca saja pada hasil build lokal dengan data portofolio asli berhasil membuka editor dan PDF sebagai admin, dengan foto diaktifkan. PDF terdiri dari dua halaman dengan teks yang dapat diseleksi dan tautan kontak aktif; tidak ada teks keluar dari margin. Bagian Projects dimulai pada halaman pertama dan berlanjut secara otomatis pada halaman kedua. Posisi nama serta kontak dipastikan berada di tengah melalui koordinat teks PDF, dengan toleransi kurang dari satu poin. Pratinjau produksi juga diperiksa pada desktop dan lebar ponsel 390 px. Worker PDF tersedia pada hasil build dan tidak ada aset server pada trace route PDF yang hilang. Pemeriksaan lokal ini tidak mengganti deployment Vercel; source terbaru tetap perlu dipush dan dideploy.
