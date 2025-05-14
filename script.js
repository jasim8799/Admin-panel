document.getElementById('movie-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form from reloading the page

  // Get form values
  const title = document.getElementById('title').value;
  const overview = document.getElementById('overview').value;
  const posterFile = document.getElementById('posterFile').files[0];
  const movieFile = document.getElementById('movieFile').files[0];
  const releaseDate = document.getElementById('releaseDate').value;
  const voteAverage = parseFloat(document.getElementById('voteAverage').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;

  // Prepare FormData to send files and other data
  const formData = new FormData();
  formData.append('title', title);
  formData.append('overview', overview);
  formData.append('category', category);
  if (posterFile) {
    formData.append('posterFile', posterFile);
  }
  if (movieFile) {
    formData.append('movieFile', movieFile);
  }
  formData.append('releaseDate', releaseDate);
  formData.append('voteAverage', voteAverage);
  formData.append('type', type);

  // Send the data to the backend API
  fetch('https://moviestreamapp-l6kk.onrender.com/api/movies', {
    method: 'POST',
    body: formData
  })
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        alert('Error: ' + (data.error || 'Unknown error'));
        console.error('Upload failed:', data);
        return;
      }
      alert('Movie uploaded successfully!');
      console.log(data); // Handle success (optionally show movie details)
    })
    .catch(error => {
      alert('Error uploading movie');
      console.error('Error:', error);
    });
});
