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

  // Display as a table
  const body = document.getElementById('resultsBody');
  body.innerHTML = "";

  if (matching.length === 0) {
    body.innerHTML = `<tr><td colspan="4">No matches</td></tr>`;
    return;
  }

  matching.forEach(id => {
    const s = samples.find(x => x.sample_id === id);
    const primerList = runs.filter(r => r.sample_id === id).map(r => r.primer_name);
    const ph = soils.find(x => x.sample_id === id && x.parameter === 'pH');

    const row = `
      <tr>
        <td>${id}</td>
        <td>${s.forest_type || ""}</td>
        <td>${primerList.join(", ") || ""}</td>
        <td>${ph ? ph.value : ""}</td>
      </tr>
    `;
    body.innerHTML += row;
  });
});
