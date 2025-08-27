// Load CSV with PapaParse and pass into DataTables
Papa.parse('data/samples.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: function(results) {
    const data = results.data;

    if (data.length === 0) {
      console.error("CSV is empty or missing headers");
      return;
    }

    // Build DataTables column definitions
    const columns = Object.keys(data[0]).map(col => ({
      title: col,
      data: col
    }));

    // Initialize DataTable
    $('#samples').DataTable({
      data: data,
      columns: columns,
      pageLength: 10
    });
  }
});
