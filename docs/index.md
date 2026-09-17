# Project Senior TI
Departemen Teknik Elektro dan Teknologi Informasi, Fakultas Teknik Universitas Gadjah Mada  

Kelompok Pelipur Junpro-Senpro  
Ketua Kelompok: Juan Christopher Reinaldo Sipayung - 24/544528/TK/60526  
Anggota 1: Theo Immanuel Sanyoto - 24/534368/TK/59227  
Anggota 2: Amelia Ocha Maharani - 24/534372/TK/59229  

## MauMakan
Jenis Produk: Layanan rekomendasi makanan  

Latar Belakang & Ide Permasalahan:  
Manusia sering merasa bingung saat mencari tempat makan. Banyak aplikasi yang sudah ada hanya menyediakan layanan meal planning tanpa memberikan rekomendasi lokasi tempat makan yang cocok. Hal ini banyak dipicu oleh ketidakcocokan harga, ketidaksesuaian selera, dan banyaknya pilihan menu yang ada.  

Ide Solusi:  
Layanan yang menawarkan rekomendasi tempat makan berdasarkan preferensi pengguna, yaitu berbasis pada budget, selera, dan lokasi. Untuk memastikan bahwa rekomendasi cocok, layanan juga menyiapkan sistem feedback berdasarkan kepuasan pengguna terhadap pilihan yang ada.  

Analisis Kompetitor:  
Grab Food Discovers (Direct Competitor), Yelp (Direct Competitor), Google Maps (Indirect Competitor)  

## Metodologi SDLC  

Metodologi yang digunakan:  
Waterfall  

Alasan pemilihan metodologi:  
Alasan pemilihan metode waterfall karena metode ini sederhana dan mudah diterapkan, memiliki tahapan yang jelas dan terstruktur, serta memudahkan pembagian dan pengelolaan pekerjaan selama proses pengembangan proyek.  

## Perancangan Tahap 1-3 SDLC  

A. Tujuan dari produk  
Layanan yang menawarkan rekomendasi tempat makan berdasarkan preferensi pengguna, yaitu berbasis pada budget, selera, dan lokasi. Untuk memastikan bahwa rekomendasi cocok, layanan juga menyiapkan sistem feedback berdasarkan kepuasan pengguna terhadap pilihan yang ada.  

B. Pengguna potensial dari produk dan kebutuhan para pengguna tersebut  

1. Pelajar/mahasiswa: Rekomendasi menu cepat saji dan lokasi terdekat, serta dengan harga yang relatif rendah.  
2. Karyawan kantoran: Rekomendasi menu dengan kandungan nutrisi yang sesuai untuk memenuhi kebutuhan harian.  
3. Fitness enthusiast: Rekomendasi menu/diet harian dengan rincian makro dan mikronutrisi yang spesifik.  
4. Masyarakat umum: Pilihan menu yang sesuai dengan selera dan kondisi alergen (jika ada), fleksibel sesuai keinginan.  

C. Use case diagram  

<div align="center">
  <img width="600" alt="Use Case Diagram" src="https://github.com/user-attachments/assets/89671938-13cf-46e2-96bb-89a5ca67d804" />
</div>

D. Functional Requirements

| ID | Requirement | Use Case |
| :--- | :--- | :--- |
| FR-01 | Pengguna dapat melakukan registrasi dan login akun | Login / Daftar |
| FR-02 | Pengguna dapat memasukkan preferensi (budget, tipe makanan, mood, lokasi) | Input Preferensi |
| FR-03 | Sistem dapat memproses pencocokan preferensi dengan data tempat makan | Lihat Rekomendasi Makanan |
| FR-04 | Pengguna dapat melakukan aksi Swipe (Skip / Like) pada kartu rekomendasi | Swipe Kartu (Skip / Like) |
| FR-05 | Pengguna dapat menggunakan fitur rekomendasi acak cepat | Surprise Me |
| FR-06 | Sistem dapat mengambil data tempat makan terdekat via Google Places API | Lihat Rekomendasi Tempat |
| FR-07 | Sistem dapat mempelajari pola interaksi pengguna untuk personalisasi otomatis | Personalisasi Otomatis |

E. Entity relationship diagram  

<div align="center">
  <img width="600" alt="Entity Relationship Diagram" src="https://github.com/user-attachments/assets/69001bf0-30ad-4437-81a3-db8fac5b9a6a" />
</div>

F. Low-fidelity Wireframe  

<div align="center">
  <img width="220" alt="Wireframe 1" src="https://github.com/user-attachments/assets/311977b1-d3c6-4158-ab39-333c34acd7c9" />
  <img width="220" alt="Wireframe 2" src="https://github.com/user-attachments/assets/acd4c9f3-04fd-4aef-9be0-271868581dff" />
  <img width="220" alt="Wireframe 3" src="https://github.com/user-attachments/assets/68c85819-5fa8-481a-a6f8-7345b58921a0" />
  <img width="220" alt="Wireframe 4" src="https://github.com/user-attachments/assets/b37258b5-1b95-4443-a174-180dc93dbc0b" />
</div>

G. Gantt-Chart Pengerjaan Proyek (1 Semester)

| No | Kegiatan | Bulan 1 | Bulan 2 | Bulan 3 | Bulan 4 |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | Inisiasi & Perancangan SDLC | v | | | |
| 2 | Analisis Kebutuhan & Wireframing | v | v | | |
| 3 | Setup Repositori & Project Tools | | v | | |
| 4 | Pengembangan Frontend & UI | | v | v | |
| 5 | Pengembangan Backend & API | | | v | v |
| 6 | Integrasi Google Places API | | | | v |
| 7 | Testing, Deployment & Evaluasi | | | | v |
