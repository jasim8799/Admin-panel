document.getElementById('movie-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form from reloading the page

  const uploadProgress = document.getElementById('uploadProgress');
  const uploadProgressBar = document.getElementById('uploadProgressBar');
  const movieDetails = document.getElementById('movieDetails');

  // Clear previous details and reset progress bar
  movieDetails.innerHTML = '';
  uploadProgressBar.style.width = '0%';
  uploadProgress.style.display = 'block';

  // Get form values
  const title = document.getElementById('title').value;
  const overview = document.getElementById('overview').value;
  const category = document.getElementById('category').value;
  const posterUrl = document.getElementById('posterUrl').value.trim();
  const videoUrl = document.getElementById('videoUrl').value;
  const releaseDate = document.getElementById('releaseDate').value;
  const voteAverage = parseFloat(document.getElementById('voteAverage').value);
  const type = document.getElementById('type').value;

  // Validate poster URL is provided
  if (!posterUrl) {
    alert('Please provide a poster image URL.');
    uploadProgress.style.display = 'none';
    return;
  }

  // Prepare FormData
  const movieData = {
    title,
    overview,
    category,
    posterPath: posterUrl,
    videoUrl,
    releaseDate,
    voteAverage,
    type
  };

  fetch('https://api-15hv.onrender.com/api/movies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(movieData)
  })
    .then(response => response.json())
    .then(data => {
      uploadProgress.style.display = 'none';
      if (data.movie) {
        movieDetails.innerHTML = `
          <h3>Movie uploaded successfully!</h3>
          <p><strong>Title:</strong> ${data.movie.title}</p>
          <p><strong>Overview:</strong> ${data.movie.overview}</p>
          <p><strong>Category:</strong> ${data.movie.category}</p>
          <p><strong>Poster URL:</strong> <a href="${data.movie.posterPath}" target="_blank">${data.movie.posterPath}</a></p>
          <p><strong>Video URL:</strong> <a href="${data.movie.videoUrl}" target="_blank">${data.movie.videoUrl}</a></p>
          <p><strong>Release Date:</strong> ${data.movie.releaseDate}</p>
          <p><strong>Vote Average:</strong> ${data.movie.voteAverage}</p>
          <p><strong>Type:</strong> ${data.movie.type}</p>
        `;
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(error => {
      uploadProgress.style.display = 'none';
      alert('Network error occurred: ' + error.message);
    });
});
