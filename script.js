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

  // Determine correct endpoint based on type
  const endpoint = type === 'Movie'
    ? 'https://api-15hv.onrender.com/api/movies'
    : 'https://api-15hv.onrender.com/api/series';

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(movieData)
  })
    .then(response => response.json())
  .then(data => {
    uploadProgress.style.display = 'none';
    const uploaded = data.movie || data.series;

    if (uploaded) {
      movieDetails.innerHTML = `
        <h3>${uploaded.type} uploaded successfully!</h3>
        <p><strong>Title:</strong> ${uploaded.title}</p>
        <p><strong>Overview:</strong> ${uploaded.overview}</p>
        <p><strong>Category:</strong> ${uploaded.category}</p>
        <p><strong>Poster URL:</strong> <a href="${uploaded.posterPath}" target="_blank">${uploaded.posterPath}</a></p>
        <p><strong>Video URL:</strong> <a href="${uploaded.videoUrl}" target="_blank">${uploaded.videoUrl}</a></p>
        <p><strong>Release Date:</strong> ${uploaded.releaseDate}</p>
        <p><strong>Vote Average:</strong> ${uploaded.voteAverage}</p>
        <p><strong>Type:</strong> ${uploaded.type}</p>
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
