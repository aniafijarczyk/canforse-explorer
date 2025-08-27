let samples = [];
let runs = [];
let soils = [];

function loadCSVs() {
  Promise.all([
  fetch('https://aniafijarczyk.github.io/canforse-explorer/data/samples.csv').then(r => r.text()),
  fetch('https://aniafijarczyk.github.io/canforse-explorer/data/runs.csv').then(r => r.text()),
  fetch('https://aniafijarczyk.github.io/canforse-explorer/data/soil.csv').then(r => r.text())
]).then(([samp, run, soil]) => {
    samples = Papa.parse(samp, { header: true }).data.filter(d => d.sample_id);
    runs = Papa.parse(run, { header: true }).data.filter(d => d.sample_id);
    soils = Papa.parse(soil, { header: true }).data.filter(d => d.sample_id);

    console.log("Samples:", samples);
    console.log("Runs:", runs);
    console.log("Soils:", soils);

    populateFilters();
  });
}

function populateFilters() {
  // Forest types
  const forestTypes = [...new Set(samples.map(d => d.forest_type))];
  const forestSelect = document.getElementById('forestType');
  forestTypes.forEach(ft => {
    forestSelect.innerHTML += `<option value="${ft}">${ft}</option>`;
  });

  // Primers
  const primers = [...new Set(runs.map(d => d.primer_name))];
  const primerSelect = document.getElementById('primer');
  primers.forEach(pr => {
    primerSelect.innerHTML += `<option value="${pr}">${pr}</option>`;
  });
}

document.getElementById('filterBtn').addEventListener('click', () => {
  const selectedForest = document.getElementById('forestType').value;
  const selectedPrimer = document.getElementById('primer').value;
  const phMin = parseFloat(document.getElementById('phMin').value) || -Infinity;
  const phMax = parseFloat(document.getElementById('phMax').value) || Infinity;

  const body = document.getElementById('resultsBody');
  body.innerHTML = "";

  // Iterate over all samples
  samples.forEach(s => {
    const sampleId = s.sample_id;

    // Forest filter
    if (selectedForest && s.forest_type !== selectedForest) return;

    // Primer filter
    const samplePrimers = runs.filter(r => r.sample_id === sampleId).map(r => r.primer_name);
    if (selectedPrimer && !samplePrimers.includes(selectedPrimer)) return;

    // Soil pH filter
    const ph = soils.find(x => x.sample_id === sampleId && x.parameter === 'pH');
    const phValue = ph ? parseFloat(ph.value) : null;
    if (phValue !== null && (phValue < phMin || phValue > phMax)) return;

    // Add row if passed all filters
    const row = `
      <tr>
        <td>${sampleId}</td>
        <td>${s.forest_type}</td>
        <td>${samplePrimers.join(", ")}</td>
        <td>${phValue ?? ""}</td>
      </tr>`;
    body.innerHTML += row;
  });
});

window.onload = loadCSVs;


