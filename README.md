# SIRATU - Sistem Informasi Rapor Mutu

Ini adalah aplikasi Next.js untuk Sistem Informasi Rapor Mutu (SIRATU) yang menggunakan Prisma sebagai ORM untuk manajemen database.

## 🚀 Langkah-langkah Menjalankan Proyek

Setelah Anda meng-kloning repositori ini, ikuti langkah-langkah berikut untuk menjalankan aplikasi secara lokal.

### 1. Buat File Konfigurasi Lingkungan (`.env`)

Buat file baru bernama `.env` di direktori root proyek. File ini akan menyimpan URL koneksi ke database Anda. Anda bisa menyalin dari contoh di bawah ini.

```
DATABASE_URL="mysql://user:password@host:port/database_name"
```

- Ganti `user` dengan nama pengguna database Anda.
- Ganti `password` dengan kata sandi database Anda.
- Ganti `host` dengan alamat host database Anda (misalnya, `localhost`).
- Ganti `port` dengan port database Anda (misalnya, `3306` untuk MySQL).
- Ganti `database_name` dengan nama database yang Anda gunakan.

### 2. Install Dependencies

Buka terminal di direktori proyek dan jalankan perintah berikut untuk menginstal semua paket yang dibutuhkan.

```bash
npm install
```

### 3. Jalankan Migrasi Database Prisma

Perintah ini akan membaca `schema.prisma` dan membuat semua tabel yang diperlukan di dalam database Anda sesuai dengan skema yang telah didefinisikan.

```bash
npx prisma migrate dev --name init
```

### 4. Seed Database

Setelah struktur database siap, jalankan perintah ini untuk mengisi tabel `User` dengan data pengguna awal (admin, direktur, dll.) yang ada di file `prisma/seed.ts`.

```bash
npx prisma db seed
```

### 5. Jalankan Aplikasi

Terakhir, jalankan server pengembangan Next.js.

```bash
npm run dev
```

Aplikasi Anda sekarang akan berjalan di [http://localhost:3000](http://localhost:3000) dan terhubung sepenuhnya dengan database Prisma Anda.
