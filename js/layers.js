// js/layers.js

// Import variabel map dan layerControl dari modul map.js
import { map, layerControl } from './map.js';

// Import fungsi untuk mengambil data dari Supabase
import { fetchBatasRTData } from './supabase.js';

// Variabel global untuk layer dan data
export var batasKelurahanLayer;
export var batasRTLayer;
export var geojsonData;

// --- Bagian Gaya ---

function style(feature) {
    return {
        color: '#007bff',
        weight: 2,
        opacity: 1,
        fillColor: 'transparent',
        fillOpacity: 0
    };
}

function highlightStyle(feature) {
    return {
        color: 'cyan',
        weight: 5,
        opacity: 1,
        fillColor: 'transparent',
        fillOpacity: 0
    };
}

// Gaya untuk Batas RT saat di-hover
function rtHighlightStyle(feature) {
    return {
        color: 'cyan',
        weight: 5,
        opacity: 1,
        fillColor: 'rgba(0, 255, 255, 0.2)', // Tambahkan fill untuk highlight yang lebih jelas
        fillOpacity: 0.2
    };
}

// --- Bagian Filter ---

export function filterByKecamatan(kecamatan) {

    if (batasKelurahanLayer && map.hasLayer(batasKelurahanLayer)) {
        map.removeLayer(batasKelurahanLayer);
        layerControl.removeLayer(batasKelurahanLayer);
    }
    
    const filteredFeatures = geojsonData.features.filter(feature => {
        return kecamatan === 'all' || feature.properties.Kecamatan === kecamatan;
    });

    const newGeojsonData = {
        "type": "FeatureCollection",
        "features": filteredFeatures
    };
    
    batasKelurahanLayer = L.geoJSON(newGeojsonData, {
        style: style,
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                var popupContent = "<table>";
                for (var key in feature.properties) {
                    if (feature.properties.hasOwnProperty(key)) {
                        if (key.toLowerCase() !== 'id' && key.toLowerCase() !== 'geom') {
                            popupContent += "<tr><td><b>" + key + "</b></td><td>" + feature.properties[key] + "</td></tr>";
                        }
                    }
                }
                popupContent += "</table>";
                layer.bindPopup(popupContent);
            }
            
            layer.on({
                mouseover: function(e) {
                    // Cari apakah kursor berada di atas Batas RT
                    let rtLayerFound = false;
                    if (batasRTLayer) {
                        batasRTLayer.eachLayer(function(rtLayer) {
                            if (rtLayer.getBounds().contains(e.latlng)) {
                                rtLayerFound = true;
                                rtLayer.setStyle(rtHighlightStyle()); // Highlight Batas RT
                            }
                        });
                    }

                    // Jika tidak ada Batas RT di bawah kursor, highlight Batas Kelurahan
                    if (!rtLayerFound) {
                        layer.setStyle(highlightStyle());
                    }
                    layer.bringToFront();
                },
                mouseout: function(e) {
                    // Reset gaya kedua layer saat mouse keluar
                    batasKelurahanLayer.resetStyle(e.target);
                    if (batasRTLayer) {
                        batasRTLayer.eachLayer(function(rtLayer) {
                            batasRTLayer.resetStyle(rtLayer);
                        });
                    }
                },
                click: function(e) {
                    L.DomEvent.stopPropagation(e);

                    let rtLayerFound = false;
                    if (batasRTLayer) {
                        batasRTLayer.eachLayer(function(rtLayer) {
                            if (rtLayer.getBounds().contains(e.latlng)) {
                                rtLayer.openPopup();
                                rtLayerFound = true;
                                return;
                            }
                        });
                    }
                    
                    if (!rtLayerFound) {
                        layer.openPopup();
                    }
                }
            });
        }
    }).addTo(map);

    layerControl.addOverlay(batasKelurahanLayer, "Batas Kelurahan");

    if (filteredFeatures.length > 0) {
        map.fitBounds(batasKelurahanLayer.getBounds());
    }
}

// --- Bagian Inisialisasi dan Penambahan Layer RT ---

export async function initializeGeoJSONLayer(data) {
    geojsonData = data;
    filterByKecamatan('all'); 
    
    const batasRTData = await fetchBatasRTData();

    if (batasRTData) {
        const batasRTGeoJSON = {
            "type": "FeatureCollection",
            "features": batasRTData.map(item => ({
                "type": "Feature",
                "properties": item,
                "geometry": item.geom
            }))
        };

        batasRTLayer = L.geoJSON(batasRTGeoJSON, {
            style: function(feature) {
                return {
                    color: '#DAA520', // Warna emas
                    weight: 2,
                    fillOpacity: 0.1
                };
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.Kelurahan && feature.properties.RT) {
                    layer.bindPopup(`<b>Batas RT</b><br>Kelurahan: ${feature.properties.Kelurahan}<br>RT: ${feature.properties.RT}`);
                }
            }
        }).addTo(map);

        layerControl.addOverlay(batasRTLayer, "Batas RT");
    }
}