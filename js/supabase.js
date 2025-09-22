// js/supabase.js

/**
 * Mengambil data geografis dari tabel Supabase dan mengubahnya menjadi format GeoJSON.
 * @returns {Promise<{geojsonData: object | null, kecamatanList: string[]}>}
 * Objek yang berisi data GeoJSON dan daftar unik nama kecamatan.
 * Jika terjadi kesalahan, akan mengembalikan null untuk geojsonData.
 */
export async function fetchGeoJSONData() {
    const supabaseUrl = 'https://czomciswyrlikxkugmrh.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6b21jaXN3eXJsaWt4a3VnbXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NzE3OTUsImV4cCI6MjA3MzM0Nzc5NX0.yMw0zxNNslPSh3DG5K24N3zdgP9_UPtZwZFsYUTW2AQ';

    const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
    };

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/Admin_Kota_Jambi?select=*`, { headers: headers });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 1. Ubah data mentah dari Supabase menjadi format GeoJSON
        const geojsonData = {
            "type": "FeatureCollection",
            "features": data.map(row => {
                const properties = { ...row };
                const geometry = properties.geom;
                delete properties.geom; // Hapus properti 'geom' dari objek properti
                
                return {
                    "type": "Feature",
                    "properties": properties,
                    "geometry": geometry
                };
            })
        };

        // 2. Ekstrak daftar unik nama kecamatan
        const kecamatanList = [...new Set(data.map(item => item.Kecamatan))].sort();
        
        // Kembalikan objek yang berisi kedua data
        return { geojsonData, kecamatanList };
        
    } catch (error) {
        console.error('Error saat mengambil data dari Supabase:', error);
        // Jika ada kesalahan, kembalikan nilai null dan array kosong
        return { geojsonData: null, kecamatanList: [] };
    }
}

/**
 * Mengambil data batas RT dari tabel Supabase dan mengembalikannya.
 * @returns {Promise<object | null>} Objek data mentah atau null jika terjadi kesalahan.
 */
export async function fetchBatasRTData() {
    const supabaseUrl = 'https://czomciswyrlikxkugmrh.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6b21jaXN3eXJsaWt4a3VnbXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NzE3OTUsImV4cCI6MjA3MzM0Nzc5NX0.yMw0zxNNslPSh3DG5K24N3zdgP9_UPtZwZFsYUTW2AQ';

    const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
    };

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/Batas_RT_Kel_Jelutung?select=*`, { headers: headers });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Kembalikan data mentah dari Supabase
        return data;
        
    } catch (error) {
        console.error('Error saat mengambil data Batas RT dari Supabase:', error);
        return null;
    }
}