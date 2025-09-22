// js/map.js

// Variabel global yang akan diekspor untuk digunakan di modul lain
export var map;
export var layerControl;

// 1. Definisikan semua lapisan (layer) basemap
export const googleMaps = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data © <a href="https://www.google.com/maps/">Google Maps</a>'
});

export const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data © <a href="https://www.google.com/maps/">Google Maps</a>'
});

export const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data © <a href="https://www.google.com/maps/">Google Maps</a>'
});

export const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

export const atrBPN = L.tileLayer('https://petadasar.atrbpn.go.id/main/wms/{x}/{y}/{z}', {
    maxZoom: 21,
    attribution: '© <a href="https://petadasar.atrbpn.go.id/">ATR/BPN</a>'
});

// 2. Fungsi utama untuk menginisialisasi peta
export function initializeMap() {
    // Inisialisasi peta Leaflet dengan view default
    map = L.map('map').setView([-1.6092, 103.6131], 12);

    // Tambahkan basemap Google Maps secara default ke peta
    googleMaps.addTo(map);

    // Definisikan objek basemaps untuk kontrol layer
    const baseMaps = {
        "Google Maps": googleMaps,
        "Google Satelit": googleSatellite,
        "Google Hybrid": googleHybrid,
        "OpenStreetMap": openStreetMap,
        "ATR/BPN": atrBPN
    };

    // Objek kosong untuk layer overlay. Ini akan diisi oleh modul lain.
    const overlayMaps = {};
    
    // Inisialisasi L.control.layers dan tambahkan ke peta.
    // Variabel ini diekspor agar bisa diakses di file lain.
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
}