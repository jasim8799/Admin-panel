document.getElementById('movie-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form from reloading the page

  // Get form values
  const title = document.getElementById('title').value;
  const overview = document.getElementById('overview').value;
  const posterPath = document.getElementById('posterPath').value;
  const releaseDate = document.getElementById('releaseDate').value;
  const voteAverage = parseFloat(document.getElementById('voteAverage').value);
  const videoUrl = document.getElementById('videoUrl').value;
  const type = document.getElementById('type').value;

  // Prepare the movie data to be sent to the backend
  const movieData = {
    title,
    overview,
    posterPath,
    releaseDate,
    voteAverage,
    videoUrl,
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
    .then(response => response.json())
    .then(data => {
      alert('Movie uploaded successfully!');
      console.log(data); // Handle success (optionally show movie details)
    })
    .catch(error => {
      alert('Error uploading movie');
      console.error('Error:', error);
    });
});
