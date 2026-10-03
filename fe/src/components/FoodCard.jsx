export function FoodCard({ food }) {
  if (!food) return null;

  // 1. Ambil data dari props 'food' yang dikirim oleh App.jsx dari Supabase
  const { name, price, category, location, image_url } = food;

  // 2. Fungsi untuk merapikan format angka harga ke standar Rupiah (Rp)
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  // 3. Menyiapkan fallback jika ada field yang kosong di database Supabase
  const displayImage = image_url || 'https://via.placeholder.com/300x200?text=No+Image';
  const displayLocation = location || 'Lokasi tidak tersedia';
  const displayCategory = category || 'Umum';

  return (
    <div className="border border-stone-300 bg-white p-4 text-stone-900 shadow-sm">
      <img 
        src={displayImage} 
        alt={name || 'Makanan'} 
        className="h-48 w-full object-cover" 
      />
      <div className="mt-3 space-y-2">
        <span className="inline-block border border-stone-900 px-2 py-0.5 text-xs font-bold">
          {displayCategory}
        </span>
        <h3 className="text-base font-bold">{name}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="font-extrabold text-stone-900">{formatRupiah(price)}</span>
          <span className="text-xs text-stone-500">📍 {displayLocation}</span>
        </div>
      </div>
    </div>
  );
}
