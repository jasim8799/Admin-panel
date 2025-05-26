document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.sidebar nav ul li a');
  const sections = document.querySelectorAll('.main-content section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      // Add active class to clicked link
      link.classList.add('active');

      const targetId = link.getAttribute('data-target');

      // Show the target section and hide others
      sections.forEach(section => {
        if (section.id === targetId) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
});

// Existing code for forms and other functions below...

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
  const videoSources = Array.from(document.querySelectorAll('#videoSources .video-source')).map(source => ({
    quality: source.querySelector('.quality').value.trim(),
    language: source.querySelector('.language').value.trim(),
    url: source.querySelector('.url').value.trim()
  }));
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
    videoSources,
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
        <p><strong>Video Sources:</strong></p>
        <ul>
          ${uploaded.videoSources.map(source => `<li>${source.quality} - ${source.language} - <a href="${source.url}" target="_blank">${source.url}</a></li>`).join('')}
        </ul>
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

function addVideoSource() {
  const container = document.getElementById('videoSources');
  const div = document.createElement('div');
  div.className = 'video-source';
  div.innerHTML = `
    <input type="text" placeholder="Quality (e.g., 720p)" class="quality" required />
    <input type="text" placeholder="Language (e.g., English)" class="language" required />
    <input type="text" placeholder="Video URL" class="url" required />
  `;
  container.appendChild(div);
}

document.getElementById('episode-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const seriesId = document.getElementById('seriesId').value;
  const episodeTitle = document.getElementById('episodeTitle').value;
  const episodeOverview = document.getElementById('episodeOverview').value;
  const episodeVideoUrl = document.getElementById('episodeVideoUrl').value;
  const episodeNumber = parseInt(document.getElementById('episodeNumber').value);

  const episodeStatus = document.getElementById('episodeStatus');
  episodeStatus.innerText = 'Uploading...';

  const episodeData = {
    seriesId,
    title: episodeTitle,
    overview: episodeOverview,
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

// Fetch existing movie titles on load
async function fetchMovieTitles() {
  try {
    const res = await fetch('https://api-15hv.onrender.com/api/movies');
    const data = await res.json();
    const select = document.getElementById('existingTitle');
    data.forEach(movie => {
      const option = document.createElement('option');
      option.value = movie._id;
      option.textContent = movie.title;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error fetching movie titles:', err);
  }
}
fetchMovieTitles();

// Handle new video source form submission
document.getElementById('videoSourceForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const movieId = document.getElementById('existingTitle').value;
  const quality = document.getElementById('newQuality').value.trim();
  const language = document.getElementById('newLanguage').value.trim();
  const url = document.getElementById('newUrl').value.trim();

  const newSource = { quality, language, url };

  try {
    const res = await fetch(`https://api-15hv.onrender.com/api/movies/${movieId}/add-source`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ videoSource: newSource })
    });

    if (res.ok) {
      alert('Video source added successfully!');
    } else {
      const error = await res.json();
      alert('Error adding source: ' + (error.message || res.statusText));
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Request failed');
  }
});
