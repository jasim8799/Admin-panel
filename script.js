document.getElementById('movie-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form from reloading the page

  // Get form values
  const title = document.getElementById('title').value;
  const overview = document.getElementById('overview').value;
  const category = document.getElementById('category').value;
  const posterPath = document.getElementById('posterPath').value;
  const videoUrl = document.getElementById('videoUrl').value;
  const releaseDate = document.getElementById('releaseDate').value;
  const voteAverage = parseFloat(document.getElementById('voteAverage').value);
  const type = document.getElementById('type').value;

  // Prepare movie data object
  const movieData = {
    title,
    overview,
    category,
    posterPath,
    videoUrl,
    releaseDate,
    voteAverage,
    type
  };

  // Send the data to the backend API
  fetch('https://moviestreamapp-l6kk.onrender.com/api/movies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(movieData)
  })
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        console.error('Upload failed:', data); // Full error from backend
        alert('Error: ' + (data.error || 'Unknown error'));
        return;
      }
      alert('Movie uploaded successfully!');
      console.log(data); // Handle success (optionally show movie details)
    })
    .catch(error => {
      console.error('Network or code error:', error);
      alert('Error uploading movie');
    });
});
