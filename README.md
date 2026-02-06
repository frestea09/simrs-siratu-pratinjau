# SIRATU - Sistem Informasi Rapor Mutu

Aplikasi Next.js ini menggunakan Prisma + MySQL untuk mensimulasikan pengelolaan mutu dan keselamatan pasien. Semua endpoint API telah didokumentasikan dengan Swagger dan dilengkapi data contoh melalui seeder.

## 🚀 Langkah Menjalankan Proyek

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Siapkan koneksi database**

   Salin `.env.example` (jika tersedia) atau tambahkan variabel berikut ke `.env`:

   ```bash
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DB_NAME"
   ```

3. **Generate & migrasi skema Prisma**

   ```bash
   npx prisma generate
   npm run prisma:migrate
   ```

4. **Isi data contoh**

   Seeder menyiapkan pengguna demo, profil indikator, capaian triwulan, insiden, risiko, notifikasi, dan log audit.

   ```bash
   npm run db:seed
   ```

5. **Jalankan aplikasi**

   ```bash
   npm run dev
   ```

   Aplikasi akan tampil di [http://localhost:3000](http://localhost:3000).

## 🔍 Dokumentasi API (Swagger)

- JSON OpenAPI dapat diakses di [`/api/docs`](http://localhost:3000/api/docs).
- UI interaktif tersedia di [`/docs`](http://localhost:3000/docs) tanpa dependensi tambahan karena memuat Swagger UI dari CDN.

## 🔑 Akun Demo

Seeder membuat beberapa akun dengan kata sandi **123456** (mis. `admin@sim.rs`). Kredensial dan peran ditampilkan di halaman login untuk memudahkan pengujian.
