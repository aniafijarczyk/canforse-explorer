let samples=[], runs=[], soil=[];
let table, map, markersLayer;

// Load CSV helper
function loadCSV(url, callback){
  Papa.parse(url, { download:true, header:true, complete: results => callback(results.data) });
}

// Initialize map
function initMap(){
  map = L.map('map').setView([45, -75], 4); // default center
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// Update map with filtered samples
function updateMap(filteredSamples){
  markersLayer.clearLayers();
  filteredSamples.forEach(s=>{
    if(s.latitude && s.longitude){
      L.marker([parseFloat(s.latitude), parseFloat(s.longitude)])
        .bindPopup(`<b>${s.sample_id}</b><br>${s.region}`)
        .addTo(markersLayer);
    }
  });
  if(filteredSamples.length>0){
    const bounds = filteredSamples.map(s=>[parseFloat(s.latitude), parseFloat(s.longitude)]);
    map.fitBounds(bounds, {padding:[50,50]});
  }
}

// Initialize dropdowns
function initFilters(){
  [...new Set(runs.map(r=>r.marker))].forEach(m=>{
    if(m) $('#markerFilter').append(`<option value="${m}">${m}</option>`);
  });
  [...new Set(soil.map(s=>s.parameter))].forEach(p=>{
    if(p) $('#parameterFilter').append(`<option value="${p}">${p}</option>`);
  });
}

// Apply filters
function applyFilters(){
  let filteredIDs = samples.map(s=>s.sample_id);

  const selectedMarker = $('#markerFilter').val();
  if(selectedMarker){
    const markerSamples = runs.filter(r=>r.marker===selectedMarker).map(r=>r.sample_id);
    filteredIDs = filteredIDs.filter(id=>markerSamples.includes(id));
  }

  const selectedParam = $('#parameterFilter').val();
  if(selectedParam){
    const paramSamples = soil.filter(s=>s.parameter===selectedParam).map(s=>s.sample_id);
    filteredIDs = filteredIDs.filter(id=>paramSamples.includes(id));
  }

  const filteredSamples = samples.filter(s=>filteredIDs.includes(s.sample_id));
  table.clear(); table.rows.add(filteredSamples); table.draw();
  updateMap(filteredSamples);
}

// Main init
$(document).ready(function(){
  initMap();
  let loaded=0;
  function initIfReady(){
    loaded++;
    if(loaded<3) return;

    initFilters();
    const cols = samples.length > 0 
      ? Object.keys(samples[0]).map(col => ({ title: col, data: col }))
      : [];

    table = $('#samples').DataTable({
      data: samples,
      columns: cols,
      pageLength: 10
    });

    $('#markerFilter,#parameterFilter').on('change', applyFilters);
    applyFilters();
  }

  loadCSV('data/samples.csv', d=>{ samples=d; initIfReady(); });
  loadCSV('data/runs.csv', d=>{ runs=d; initIfReady(); });
  loadCSV('data/soil.csv', d=>{ soil=d; initIfReady(); });
});

