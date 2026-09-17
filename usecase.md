# Deskripsi Project: **Mau Makan Apa?** (Food Decision App)

## Latar Belakang / Masalah
Banyak orang menghabiskan waktu cukup lama hanya untuk memutuskan "mau makan apa hari ini" — bingung karena terlalu banyak pilihan, budget terbatas, atau lagi pengen sesuatu yang spesifik tapi nggak tau namanya apa. Aplikasi ini hadir untuk menyelesaikan masalah "decision fatigue" seputar makanan.

## Solusi
Sebuah web app yang membantu user menentukan pilihan makanan secara cepat berdasarkan preferensi personal (budget, mood, tipe makanan, lokasi), lalu memberikan rekomendasi makanan sekaligus tempat untuk membelinya di sekitar user.

## Target Pengguna
- Orang yang sering bingung/galau soal makan (indecisive eaters)
- Pekerja/mahasiswa yang butuh keputusan cepat saat jam makan siang
- Orang baru di suatu daerah yang belum tau tempat makan sekitar

## Alur Pengguna (User Flow)
1. **Login/Daftar** (atau lanjut sebagai Guest)
2. **Input preferensi**: range harga, tipe makanan, mood, lokasi
3. **Loading** — sistem mencocokkan preferensi
4. **Hasil rekomendasi**: kartu makanan yang bisa di-swipe (skip/cocok), lengkap dengan estimasi harga, jarak, dan tempat makan terdekat

## Fitur Utama
| Fitur | Deskripsi |
|---|---|
| Login/Sign Up | Autentikasi user, atau opsi guest tanpa daftar |
| Filter Preferensi | Budget, tipe makanan, mood, lokasi |
| Rekomendasi Swipeable | Kartu makanan interaktif, bisa skip/like |
| Rekomendasi Tempat | Terintegrasi dengan data lokasi (mis. Google Places) |
| Surprise Me | Rekomendasi acak untuk yang benar-benar bingung |
| Riwayat & Favorit | Menyimpan histori pilihan dan makanan favorit |
| Personalisasi | Sistem belajar dari pola pilihan user dari waktu ke waktu |

## Value Proposition
Mengubah proses "bingung mau makan apa" yang biasanya makan waktu 10-15 menit menjadi keputusan cepat dalam hitungan detik, dengan rekomendasi yang terasa personal — bukan sekadar daftar random.

## Status Project Saat Ini
Sudah ada **wireframe low-fidelity** (HTML/CSS, tanpa styling warna) yang mencakup alur: Login → Input Preferensi → Loading → Hasil Rekomendasi. Tahap selanjutnya: penentuan visual identity (warna, tipografi, gaya UI) dan pengembangan fitur backend (data makanan, integrasi lokasi, sistem personalisasi).
