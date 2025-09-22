// js/controls.js

// Import variabel map dari modul map.js
import { map } from './map.js';

// Import fungsi filterByKecamatan dari modul layers.js
import { filterByKecamatan } from './layers.js';

/**
 * Fungsi untuk menyiapkan dan menambahkan semua kontrol ke peta.
 * @param {Array<string>} kecamatanList Daftar nama kecamatan untuk dropdown filter.
 */
export function setupControls(kecamatanList) {
    // 1. Kontrol Marker Interaktif
    // Lapisan untuk menampung marker yang dibuat saat klik
    const markers = L.layerGroup().addTo(map);

    // Event listener untuk klik peta
    map.on('click', function(e) {
        markers.clearLayers(); // Hapus marker sebelumnya
        L.marker(e.latlng).addTo(markers)
            .bindPopup("Latitude: " + e.latlng.lat.toFixed(6) + "<br>" + "Longitude: " + e.latlng.lng.toFixed(6)).openPopup();
    });

    // 2. Kontrol Filter Kustom (Dropdown)
    const FilterControl = L.Control.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar filter-control');
            const label = L.DomUtil.create('label', '', container);
            label.textContent = 'Filter: ';
            const select = L.DomUtil.create('select', '', container);
            select.id = 'filter-kecamatan';

            L.DomEvent.disableClickPropagation(container);

            // Tambahkan opsi 'Semua Kecamatan'
            const allOption = L.DomUtil.create('option', '', select);
            allOption.value = 'all';
            allOption.textContent = 'Semua Kecamatan';

            // Tambahkan opsi kecamatan dari daftar yang diberikan
            kecamatanList.forEach(kecamatan => {
                const option = L.DomUtil.create('option', '', select);
                option.value = kecamatan;
                option.textContent = kecamatan;
            });

            // Event listener saat nilai dropdown berubah
            select.addEventListener('change', (e) => {
                filterByKecamatan(e.target.value);
            });

            return container;
        },
        onRemove: function(map) {
            // Cleanup jika diperlukan
        }
    });
    new FilterControl({ position: 'topright' }).addTo(map);

    // 3. Kontrol Pencarian Lokasi (Geocoder) dan Skala
    L.Control.geocoder().addTo(map);
    L.control.scale().addTo(map);

    // 4. Kontrol Menggambar (Draw Tools)
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        position: 'topleft',
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            polygon: { showArea: true },
            polyline: true,
            rectangle: true,
            circle: true,
            marker: true,
            circlemarker: true
        }
    });
    map.addControl(drawControl);

    // Event handler saat fitur baru digambar
    map.on(L.Draw.Event.CREATED, function(event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);

        // Jika yang digambar adalah poligon atau persegi, hitung luasnya
        if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            const area_m2 = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            const area_ha = (area_m2 / 10000).toFixed(2);
            layer.bindPopup('Luas: ' + area_ha + ' ha').openPopup();
        }
    });
}