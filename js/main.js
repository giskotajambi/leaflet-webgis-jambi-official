// js/main.js

// Import semua fungsionalitas dari modul yang berbeda
import { initializeMap, layerControl } from './map.js';
// Hapus getOverlayLayers karena sudah dihapus dari layers.js
import { initializeGeoJSONLayer } from './layers.js'; 
import { setupControls } from './controls.js';
import { fetchGeoJSONData } from './supabase.js';

// Fungsi utama yang akan dijalankan saat halaman web dimuat
window.onload = async function() {
    try {
        // 1. Inisialisasi peta Leaflet. Ini harus dijalankan pertama kali.
        initializeMap();

        // 2. Ambil data GeoJSON dari Supabase secara asinkron (menunggu data selesai diunduh)
        const { geojsonData, kecamatanList } = await fetchGeoJSONData();

        // 3. Jika data berhasil dimuat, inisialisasi layer GeoJSON dan kontrol
        if (geojsonData) {
            // Panggil initializeGeoJSONLayer untuk memuat batas kelurahan DAN batas RT
            // Fungsi ini akan menambahkan layer batas RT ke layerControl
            initializeGeoJSONLayer(geojsonData);
            
            // Siapkan kontrol lain, termasuk dropdown filter
            setupControls(kecamatanList);
        } else {
            console.error("Gagal memuat data GeoJSON. Peta tidak akan menampilkan batas kelurahan.");
        }
    } catch (error) {
        // Tangani kesalahan yang mungkin terjadi selama proses
        console.error("Terjadi kesalahan saat memuat aplikasi:", error);
    }
};