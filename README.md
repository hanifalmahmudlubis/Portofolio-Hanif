# Hanif Portfolio Studio

Portofolio Next.js dengan halaman publik, galeri proyek, dan CMS admin. Data proyek, pengalaman, sertifikat, teknologi, serta pesan tersimpan di PostgreSQL melalui Prisma.

## Menjalankan project

1. Gunakan Node.js 22 dan PostgreSQL.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL`, `NEXTAUTH_URL`, dan `NEXTAUTH_SECRET`. Jangan mengganti konfigurasi database yang sudah ada tanpa sengaja.
4. Terapkan migrasi dengan `npm run db:migrate`.
5. Jalankan `npm run dev`, lalu buka http://localhost:3000.

Admin tersedia di `/admin/login`. Login menggunakan akun ADMIN dengan password bcrypt. Untuk membuat akun atau mengganti password akun lama, isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di lingkungan lokal lalu jalankan `npm run db:seed`. Password minimal 8 karakter, maksimal 72 byte. Seed **tidak menghapus konten yang ada**. Akun yang dibuat seed lama dengan password plaintext harus diperbarui melalui proses ini.

## Deploy ke Vercel

Repository sudah menyediakan `vercel.json`, Node.js 22, build Next.js, dan generate Prisma Client. `npm ci` menggunakan lockfile; folder lokal, kredensial, laporan tes, dan konfigurasi editor dikecualikan dari deploy melalui `.vercelignore`.

1. Push source ke GitHub dan import repository di Vercel. Pilih framework **Next.js**, root directory project ini, install command `npm ci`, dan build command `npm run build`. Output directory mengikuti default Next.js.
2. Isi Environment Variables di Vercel:

   | Variabel                | Isi                                                                                                                      |
   | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
   | `DATABASE_URL`          | PostgreSQL hosted yang bisa diakses Vercel, dengan SSL sesuai penyedia; gunakan pooled URL untuk runtime jika tersedia   |
   | `NEXTAUTH_URL`          | Domain HTTPS deployment, misalnya `https://nama-project.vercel.app`; jangan `localhost`                                  |
   | `NEXTAUTH_SECRET`       | Secret acak minimal 32 karakter; gunakan nilai yang sama untuk seluruh instance                                          |
   | `BLOB_STORE_ID`         | ID **Public Blob store** yang terhubung ke project dan environment deployment; pada Vercel dipakai bersama OIDC otomatis |
   | `BLOB_READ_WRITE_TOKEN` | Alternatif token statis dari store yang sama, terutama untuk upload dari server lokal di luar Vercel                     |

3. Sebelum menjalankan aplikasi pada database baru, jalankan `npm run db:migrate` menggunakan koneksi database tujuan. Jika belum ada admin, isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD`, lalu jalankan `npm run db:seed` sekali. Kredensial seed tidak perlu disimpan di Git atau disediakan ke frontend.
4. Jalankan `npm run check:deploy` dengan environment produksi untuk memeriksa konfigurasi tanpa mencetak secret. Gunakan `npm run check:deploy -- --code-only` untuk pemeriksaan source tanpa kredensial produksi.
5. Jalankan `npm run build`, kemudian deploy. Pastikan variabel tersedia pada environment Production/Preview yang dituju. Gunakan database terpisah untuk Preview agar konten produksi tidak berubah saat menguji CRUD.

Upload pada Vercel menggunakan Vercel Blob, bukan disk lokal. SDK menerima autentikasi OIDC otomatis dari Vercel bersama `BLOB_STORE_ID`, atau `BLOB_READ_WRITE_TOKEN` sebagai alternatif. Kode tidak menyalin token OIDC sehingga SDK tetap dapat mengambil kredensial runtime terbaru. Admin tetap dapat memilih 8 gambar sekaligus; tiap gambar dikirim terpisah dengan batas **4 MB/gambar**, sehingga request multipart berada di bawah batas 4.5 MB Vercel Functions. Gambar yang sudah sukses diunggah tidak dikirim ulang ketika berkas berikutnya gagal. Tanpa konfigurasi Blob, API memberi pesan konfigurasi dan tidak menulis ke filesystem Vercel.

Jika upload foto intro menampilkan **Penyimpanan gambar belum dikonfigurasi**, buka project Vercel yang melayani domain situs, lalu hubungkan **Public Blob store** melalui tab Storage ke environment **Production** (dan Preview bila digunakan). Pastikan `BLOB_STORE_ID` tersedia, atau tambahkan `BLOB_READ_WRITE_TOKEN` pada Settings → Environment Variables. Setelah disimpan, lakukan **Redeploy**: perubahan environment tidak berlaku pada deployment lama. File `.env` lokal tidak ikut diunggah dan bukan pengganti pengaturan environment Vercel. Jangan menambahkan prefiks `NEXT_PUBLIC_` pada token.

Gambar lama yang masih direferensikan database disertakan di `public/portfolio`. Rewrite `/uploads/projects/:file` mempertahankan URL lama saat berkas tidak ada di folder upload lokal. File upload lain tetap lokal dan tidak ikut dikirim. Menyambungkan Blob store dan mengisi variabel pada akun Vercel tetap diperlukan; pemeriksaan lokal tidak menggantikan deployment nyata pada akun tersebut.

Jika menambah gambar dalam mode disk lokal sebelum deploy berikutnya, salin gambar yang dipakai ke `public/portfolio` dengan nama berkas yang sama, atau isi token Blob pada lingkungan lokal agar upload langsung tersimpan di cloud. Upload lokal tidak otomatis tersinkron ke Vercel.

Rujukan: [Vercel server uploads](https://vercel.com/docs/vercel-blob/server-upload), [batas Functions](https://vercel.com/docs/functions/limitations), [Prisma v6 pada Vercel](https://www.prisma.io/docs/orm/v6/prisma-client/deployment/serverless/deploy-to-vercel).

## Alur fitur

- Proyek dan sertifikat diurutkan dari tahun terbaru. Pengalaman yang masih berjalan berada paling atas, diikuti tanggal selesai dan mulai terbaru; format lama seperti `Sep 2024` tetap diurutkan dengan benar. Daftar admin dan API menggunakan urutan yang sama.
- Foto intro dapat diganti melalui **Admin → Foto intro** (`/admin/profile`), lengkap dengan pratinjau dan opsi menggunakan foto awal. Upload memakai Vercel Blob bila token tersedia, atau disk lokal saat development. Foto lama dibersihkan setelah penggantian jika tidak lagi dipakai oleh pengaturan, proyek, atau pengalaman.
- Header menandai bagian yang sedang terlihat saat scroll, termasuk tautan langsung ke section dan menu mobile. Halaman daftar/detail proyek menandai menu Projects.
- Simpan proyek sebagai draft atau publikasikan ke situs. Draft tidak dikirim oleh API publik dan tidak bisa dibuka melalui slug publik.
- Teknologi dipilih dari daftar bersama; teknologi baru dapat ditambahkan langsung dari editor proyek.
- Gambar dapat dipilih hingga 8 sekaligus (maksimal 4 MB/gambar), dijadikan sampul, dilihat di galeri, dan dihapus. Slider berganti otomatis setiap 5 detik, dengan tombol jeda, thumbnail, swipe, dan tampilan penuh. Pergantian dijeda saat hover, fokus keyboard, membuka tampilan penuh, atau tab tidak aktif; reduced motion menonaktifkan autoplay secara default. Penghapusan proyek juga membersihkan gambar serta relasi teknologinya.
- Perubahan pengalaman mendukung penggantian/penghapusan seluruh daftar gambar. Tanggal lama seperti `Sep 2024` tetap terbaca, lalu disimpan sebagai `YYYY-MM` saat diedit.
- Formulir kontak membuat pesan di kotak masuk admin. Status dibaca terhubung dengan statistik dashboard. Balasan dilakukan melalui aplikasi email admin.
- Sertifikat mendukung tautan kredensial opsional.
- URL GitHub dan LinkedIn terpusat di `src/lib/site.ts`. URL repository khusus proyek tetap diutamakan jika diisi.
- Urutan halaman dan header: Intro (termasuk About dan foto), Projects, Experience, Skills, Certificates, Contact. Font menggunakan Arial dengan judul tebal dan palet hitam–navy.
- Partikel dengan perspektif dan parallax hanya dirender pada halaman publik; seluruh route admin mengikuti warna/font tanpa partikel. Animasi menghormati reduced motion dan berhenti saat tab tidak aktif.

## Struktur backend

```text
app/api/                   HTTP, autentikasi, dan invalidasi halaman
src/lib/services/          Query dan operasi data lintas fitur
src/lib/validation.ts      Validasi payload sebelum menyentuh database
src/lib/api/errors.ts      Respons error yang konsisten
src/lib/admin.ts           Verifikasi sesi dan role admin dari database
src/lib/auth.ts            Login credentials + sesi JWT
src/lib/uploads.ts         Validasi dan penyimpanan berkas gambar
src/lib/api-client.ts      Pemanggilan API dari form dan interaksi browser
src/types/                 Tipe data antarkomponen
```

Server Components memakai layanan data yang sama dengan API agar tidak membuat request HTTP ke server sendiri. Semua perubahan dari browser masuk melalui API. Relasi memakai nested writes/transaction Prisma; referential cascade mengikuti schema yang sudah ada. Setiap mutasi memperbarui halaman publik dan admin.

## Kontrak API

Keberhasilan mengembalikan objek/array JSON; create menggunakan status `201`. Error berbentuk:

```json
{ "message": "Penjelasan error", "fields": { "slug": "Petunjuk opsional" } }
```

Status utama: `400` validasi, `401` sesi admin tidak valid, `403` origin tidak diizinkan, `404` data tidak ditemukan, `409` slug duplikat, `413` payload terlalu besar, `415` content type salah, `429` pembatasan request, `503` layanan data tidak tersedia.

| Endpoint                   | Metode                | Akses / fungsi                                                         |
| -------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `/api/portfolio`           | GET                   | Publik: proyek published, pengalaman, sertifikat, teknologi            |
| `/api/projects`            | GET / POST            | Daftar publik / buat proyek sebagai admin                              |
| `/api/projects/:id`        | GET / PUT / DELETE    | Baca proyek published / ubah dan hapus sebagai admin                   |
| `/api/admin/projects`      | GET                   | Admin: semua proyek termasuk draft                                     |
| `/api/projects/:id/images` | POST / PATCH / DELETE | Admin: upload, sampul, hapus gambar                                    |
| `/api/experience`          | GET / POST            | Publik: daftar / admin: buat                                           |
| `/api/experience/:id`      | GET / PUT / DELETE    | Publik: baca / admin: ubah, hapus                                      |
| `/api/certificate`         | GET / POST            | Publik: daftar / admin: buat                                           |
| `/api/certificate/:id`     | GET / PUT / DELETE    | Publik: baca / admin: ubah, hapus                                      |
| `/api/technologies`        | GET / POST            | Publik: daftar / admin: tambah                                         |
| `/api/contact`             | POST                  | Publik: kirim pesan dengan validasi dan pembatasan request             |
| `/api/admin/messages`      | GET                   | Admin: kotak masuk                                                     |
| `/api/admin/messages/:id`  | PATCH / DELETE        | Admin: ubah isRead / hapus                                             |
| `/api/admin/dashboard`     | GET                   | Admin: statistik dan proyek terbaru                                    |
| `/api/admin/profile`       | GET / POST / DELETE   | Admin: foto intro saat ini / upload satu gambar / kembali ke foto awal |

Contoh membaca data dari browser:

```ts
import { api } from "@/lib/api-client";
import type { Project } from "@/types/project";

const projects = await api<Project[]>("/api/projects");
```

Payload proyek: `title`, `slug`, `shortDescription`, `fullDescription`, `category`, `projectType`, `year`, dengan `problem`, `solution`, `githubUrl`, `liveDemoUrl`, `published`, `featured`, `displayOrder`, dan `technologyIds` opsional. PUT mengirim seluruh kolom teks wajib. Jika daftar relasi tidak dikirim, relasi lama dipertahankan; array kosong menghapus relasi.

Upload memakai multipart `images` (PNG, JPEG, WebP, GIF; maksimal 4 MB/berkas dan 4 MB + 64 KB untuk seluruh body multipart). Client admin mengirim satu berkas per request untuk kompatibilitas Vercel, meskipun pemilihan berkas mendukung 8 gambar. PATCH gambar mengirim `{ "imageId": "..." }`. DELETE gambar memakai query `?imageId=...`. ID gambar wajib dimiliki proyek pada URL.

## Pengujian

```sh
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
```

`test:integration` membuat cluster PostgreSQL **lokal terpisah**, menjalankan migrasi, membuat fixture dan kredensial sementara, menyalakan Next.js, lalu menguji API dan browser dengan Playwright. Database pada `.env` tidak digunakan atau diubah. PostgreSQL sementara dihentikan setelah tes. Direktori `.test-data`, `test-results`, dan `playwright-report` diabaikan Git.

Default lokasi PostgreSQL adalah `C:/Program Files/PostgreSQL/16/bin` pada Windows atau `/usr/lib/postgresql/16/bin` pada Linux; ubah dengan `PG_BIN`. Di Windows tes menggunakan Google Chrome yang sudah terpasang. Pada platform lain pasang Chromium melalui `npx playwright install chromium` atau isi `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Tes mencakup validasi input, login/logout, penolakan akses anonim/non-admin, draft publik, seluruh CRUD utama, relasi teknologi dan gambar, invalidasi data publik, duplikasi slug, unggahan palsu, kepemilikan gambar, kontak–inbox–dashboard, serta navigasi mobile. Screenshot tersimpan di `test-results`. Kredensial tes hanya hidup di lingkungan proses dan database sementara.

## Catatan operasional

- Dengan OIDC Vercel dan `BLOB_STORE_ID`, atau `BLOB_READ_WRITE_TOKEN`, gambar disimpan dan dihapus melalui Vercel Blob. Tanpa kredensial cloud, server lokal memakai `public/uploads/projects` dan `public/uploads/profile`; mode disk lokal tidak diizinkan untuk upload di Vercel. Cadangkan folder upload lokal bersama database jika memakai host Node dengan disk persisten.
- Rate limiter saat ini berada di memori satu proses. Gunakan shared store seperti Redis jika menjalankan banyak instance.
- Cadangkan PostgreSQL dan folder upload bersama. Jangan menjalankan seed lama yang menghapus database.
- Build menjalankan pemeriksaan TypeScript; opsi lama `ignoreBuildErrors` sudah dihapus.
- Migrasi `20261102090000_add_site_settings` menambahkan tabel pengaturan foto intro. Jalankan `npm run db:migrate` sebelum deploy revisi ini; migrasi tidak menghapus konten yang ada. Tanpa foto kustom, intro menggunakan `/profile.jpg`.

## Status audit dependency

Next.js telah diperbarui ke 16.4.3 dan pembaruan kompatibel dependency sudah diterapkan. Audit terakhir masih melaporkan 19 temuan: 16 moderate pada rantai tooling ESLint/minimatch dan 3 high pada rantai Prisma/deepmerge-ts. Audit dengan `--omit=dev` juga masih mencantumkan 3 temuan Prisma tersebut. Perbaikan yang disarankan npm membutuhkan perubahan versi mayor; `audit fix --force` tidak diterapkan karena bisa mematahkan konfigurasi/database client. Migrasi versi mayor dependency perlu ditangani dan diuji tersendiri.
