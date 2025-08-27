let samples = [];
let runs = [];
let soils = [];

let samples = [], runs = [], soils = [];

// Load CSVs
Promise.all([
  fetch('data/samples.csv').then(r => r.text()).then(t => Papa.parse(t, {header:true}).data),
  fetch('data/runs.csv').then(r => r.text()).then(t => Papa.parse(t, {header:true}).data),
  fetch('data/soil.csv').then(r => r.text()).then(t => Papa.parse(t, {header:true}).data)
]).then(([samp, run, soil]) => {
  samples = samp.filter(d => d.sample_id);
  runs = run.filter(d => d.sample_id);
  soils = soil.filter(d => d.sample_id);

  // Fill dropdowns
  fillDropdown('forestType', [...new Set(samples.map(d => d.forest_type))]);
  fillDropdown('primerName', [...new Set(runs.map(d => d.primer_name))]);
});

function fillDropdown(id, values) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">-- Any --</option>` +
    values.map(v => `<option value="${v}">${v}</option>`).join('');
}

// Filtering
document.getElementById('filterBtn').addEventListener('click', () => {
  const forestType = document.getElementById('forestType').value;
  const primer = document.getElementById('primerName').value;
  const phMin = parseFloat(document.getElementById('phMin').value);

  let matching = samples.map(d => d.sample_id);

  if (forestType) {
    matching = matching.filter(id => samples.find(s => s.sample_id === id).forest_type === forestType);
  }

  if (primer) {
    const primerSamples = runs.filter(r => r.primer_name === primer).map(r => r.sample_id);
    matching = matching.filter(id => primerSamples.includes(id));
  }

  if (!isNaN(phMin)) {
    const phSamples = soils.filter(s => s.parameter === 'pH' && parseFloat(s.value) >= phMin)
                           .map(s => s.sample_id);
    matching = matching.filter(id => phSamples.includes(id));
  }

  // Display
  const list = document.getElementById('results');
  list.innerHTML = matching.length ? matching.map(id => `<li>${id}</li>`).join('') : '<li>No matches</li>';
});



