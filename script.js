document.getElementById('movie-form').addEventListener('submit', async function (event) {
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
  const region = document.getElementById('region').value;
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

  // Prepare movie data object
  const movieData = {
    title,
    overview,
    category,
    region,
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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(movieData)
    });

    const data = await response.json();
    uploadProgress.style.display = 'none';

    // check both movie and series fields, and fallback to generic 'data' or 'movie'
    const uploaded = data.movie || data.series || data.data;

    if (response.ok && uploaded) {
      movieDetails.innerHTML = `
        <h3>${type} uploaded successfully!</h3>
        <p><strong>Title:</strong> ${uploaded.title}</p>
        <p><strong>Overview:</strong> ${uploaded.overview}</p>
        <p><strong>Category:</strong> ${uploaded.category}</p>
        <p><strong>Region:</strong> ${uploaded.region}</p>
        <p><strong>Poster URL:</strong> <a href="${uploaded.posterPath}" target="_blank">${uploaded.posterPath}</a></p>
        <p><strong>Video URL:</strong> <a href="${uploaded.videoUrl}" target="_blank">${uploaded.videoUrl}</a></p>
        <p><strong>Release Date:</strong> ${uploaded.releaseDate}</p>
        <p><strong>Vote Average:</strong> ${uploaded.voteAverage}</p>
        <p><strong>Type:</strong> ${uploaded.type}</p>
      `;
    } else {
      alert('Error: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    uploadProgress.style.display = 'none';
    alert('Network error occurred: ' + error.message);
  }
});
