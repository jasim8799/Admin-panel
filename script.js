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

document.getElementById('episode-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const seriesId = document.getElementById('seriesId').value;
  const episodeTitle = document.getElementById('episodeTitle').value;
  const episodeVideoUrl = document.getElementById('episodeVideoUrl').value;
  const episodeNumber = parseInt(document.getElementById('episodeNumber').value);

  const episodeStatus = document.getElementById('episodeStatus');
  episodeStatus.innerText = 'Uploading...';

  const episodeData = {
    seriesId,
    title: episodeTitle,
    videoUrl: episodeVideoUrl,
    episodeNumber
  };

  try {
    const response = await fetch('https://api-15hv.onrender.com/api/episodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(episodeData)
    });

    const data = await response.json();

    if (response.ok && data.episode) {
      episodeStatus.innerHTML = `<span style="color:green;">Episode uploaded successfully! Title: ${data.episode.title}</span>`;
    } else {
      episodeStatus.innerHTML = `<span style="color:red;">Error: ${data.error || 'Failed to upload episode.'}</span>`;
    }
  } catch (error) {
    episodeStatus.innerHTML = `<span style="color:red;">Network Error: ${error.message}</span>`;
  }
});

// Function to fetch series list and populate the seriesId dropdown
async function fetchSeriesList() {
  try {
    const response = await fetch('https://api-15hv.onrender.com/api/series');
    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      const seriesSelect = document.getElementById('seriesId');
      // Clear existing options except the placeholder
      seriesSelect.innerHTML = '<option value="" disabled selected>Select a series</option>';

      data.forEach(series => {
        const option = document.createElement('option');
        option.value = series._id || series.id || series.seriesId || '';
        option.textContent = series.title || series.name || 'Untitled Series';
        seriesSelect.appendChild(option);
      });
    } else {
      console.error('Failed to fetch series list:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Network error while fetching series list:', error.message);
  }
}

// Call fetchSeriesList on page load
window.addEventListener('DOMContentLoaded', fetchSeriesList);
