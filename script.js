let samples = [];
let runs = [];
let soil = [];
let table;
let map;
let markersLayer;

// Load all CSVs in parallel
function loadCSV(url, callback) {
  Papa.parse(url, {
    download: true,
    header: true,
    complete: (results) => callback(results.data)
  });
}

// Initialize map
function initMap() {
  map = L.map('map').setView([45, -75], 4); // center view
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// Update map markers for filtered samples
function updateMap(filteredSamples) {
  markersLayer.clearLayers();
  filteredSamples.forEach(s => {
    if (s.latitude && s.longitude) {
      L.marker([parseFloat(s.latitude), parseFloat(s.longitude)])
        .bindPopup(`<b>${s.sample_id}</b><br>${s.region}`)
        .addTo(markersLayer);
    }
  });

  // Optional: fit map to markers
  if (filteredSamples.length > 0) {
    const bounds = filteredSamples.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

// Initialize filters dropdowns
function initFilters() {
  const markers = [...new Set(runs.map(r => r.marker))];
  markers.forEach(m => $('#markerFilter').append(`<option value="${m}">${m}</option>`));

  const parameters = [...new Set(soil.map(s => s.parameter))];
  parameters.forEach(p => $('#parameterFilter').append(`<option value="${p}">${p}</option>`));
}

function applyFilters() {
  let filteredSampleIDs = samples.map(s => s.sample_id);

  // Marker filter
  const selectedMarker = $('#markerFilter').val();
  if (selectedMarker) {
    const markerSamples = runs.filter(r => r.marker === selectedMarker).map(r => r.sample_id);
    filteredSampleIDs = filteredSampleIDs.filter(id => markerSamples.includes(id));
  }

  // Soil parameter filter
  const selectedParam = $('#parameterFilter').val();
  if (selectedParam) {
    const paramSamples = soil.filter(s => s.parameter === selectedParam).map(s => s.sample_id);
    filteredSampleIDs = filteredSampleIDs.filter(id => paramSamples.includes(id));
  }

  // Update table
  const filteredSamples = samples.filter(s => filteredSampleIDs.includes(s.sample_id));
  table.clear();
  table.rows.add(filteredSamples);
  table.draw();

  // Update map
  updateMap(filteredSamples);
}

// Load CSVs and initialize table
$(document).ready(function() {
  initMap();
  loadCSV('data/samples.csv', (data) => { samples = data; initIfReady(); });
  loadCSV('data/runs.csv', (data) => { runs = data; initIfReady(); });
  loadCSV('data/soil.csv', (data) => { soil = data; initIfReady(); });

  let loadedCount = 0;
  function initIfReady() {
    loadedCount++;
    if (loadedCount < 3) return;

    // Initialize filters
    initFilters();

    // Initialize DataTable
    table = $('#samples').DataTable({
      data: samples,
      columns: Object.keys(samples[0]).map(col => ({ title: col, data: col })),
      pageLength: 10
    });

    // Set filter event handlers
    $('#markerFilter, #parameterFilter').on('change', applyFilters);
  }
});

