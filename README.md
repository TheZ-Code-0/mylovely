# Halaman buat Vivi

Satu halaman statis. Nggak butuh build, nggak butuh server — cukup di-upload apa adanya.

## Isi folder

```
index.html            <- halaman
style.css             <- tampilan
script.js             <- lagu + ritme baca
foto.jpg              <- foto
sekali-ini-saja.mp3   <- lagunya
```

Semua sudah lengkap, tinggal di-upload apa adanya. Kalau suatu saat kamu ganti lagunya,
ubah juga `SONG_URL` di baris paling atas `script.js` supaya namanya cocok. Kalau file
mp3-nya nggak ketemu, halaman otomatis main melodi bawaan.

## Upload ke GitHub Pages

1. Buat repo baru di GitHub, misalnya `untuk-vivi`.
2. Klik **Add file → Upload files**, seret semua isi folder ini (termasuk foto dan mp3),
   lalu **Commit changes**.
3. Masuk **Settings → Pages**. Di bagian *Build and deployment*, pilih
   Source: **Deploy from a branch**, Branch: **main**, folder: **/ (root)**. Save.
4. Tunggu 1–2 menit. Link-nya muncul di halaman itu juga, formatnya:
   `https://<username>.github.io/untuk-vivi/`

Selesai. Link itu yang kamu kirim.

## Dua hal yang perlu kamu tahu dulu

**Repo public = semuanya bisa diakses siapa saja.** Foto, tulisan, dan mp3-nya bisa
dibuka orang lain kalau mereka tahu URL-nya, dan file-file itu juga bisa ditelusuri
lewat halaman repo. Sudah aku pasang tag `noindex` biar nggak muncul di Google, tapi itu
bukan pengaman — cuma bikin nggak terindeks. Kalau mau lebih tertutup, pilih repo private,
tapi GitHub Pages untuk repo private butuh akun berbayar.

**Mp3-nya berhak cipta.** Upload ke repo public artinya kamu ikut menyebarkan file lagunya.
Kalau nggak nyaman, jangan sertakan mp3-nya — halaman tetap jalan dengan melodi bawaan.
