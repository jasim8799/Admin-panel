// Navigation for sidebar links
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

document.getElementById('movie-form').addEventListener('submit', async function (event) {
  event.preventDefault();

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
  const videoLinks = Array.from(document.querySelectorAll('#videoSources .video-source')).map(source => ({
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
    videoLinks,
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
        // Include other headers like Authorization if required
      },
      body: JSON.stringify(movieData)
    });

    const data = await response.json();
    uploadProgress.style.display = 'none';

    // Check for errors in the response
    if (!response.ok) {
      throw new Error(data.error || 'Unknown error occurred');
    }

    const uploaded = data.movie || data.series || data.data;

    if (uploaded) {
      movieDetails.innerHTML = `
        <h3>${type} uploaded successfully!</h3>
        <p><strong>Title:</strong> ${uploaded.title}</p>
        <p><strong>Overview:</strong> ${uploaded.overview}</p>
        <p><strong>Category:</strong> ${uploaded.category}</p>
        <p><strong>Region:</strong> ${uploaded.region}</p>
        <p><strong>Poster URL:</strong> <a href="${uploaded.posterPath}" target="_blank">${uploaded.posterPath}</a></p>
        <p><strong>Video Sources:</strong></p>
        <ul>
          ${uploaded.videoLinks.map(source => `<li>${source.quality} - ${source.language} - <a href="${source.url}" target="_blank">${source.url}</a></li>`).join('')}
        </ul>
        <p><strong>Release Date:</strong> ${uploaded.releaseDate}</p>
        <p><strong>Vote Average:</strong> ${uploaded.voteAverage}</p>
        <p><strong>Type:</strong> ${uploaded.type}</p>
      `;
    } else {
      alert('Error: Invalid response from server.');
    }
  } catch (error) {
    uploadProgress.style.display = 'none';
    alert('An error occurred: ' + error.message);
  }
});

// Upload Episode
document.getElementById('episodeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const episodeData = {
    seriesId: form.seriesId.value,
    title: form.title.value,
    episodeNumber: parseInt(form.episodeNumber.value),
    language: form.language.value,
    quality: form.quality.value,
    url: form.url.value
  };

  try {
    const res = await fetch(`${API_URL}/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(episodeData)
    });

    const data = await res.json();

    if (res.ok) {
      alert('Episode Uploaded! Title: ' + (data.episode ? data.episode.title : 'Unknown'));
      form.reset();
    } else {
      alert('Upload Failed: ' + (data.error || JSON.stringify(data)));
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
});

// Add Video Source to Existing Movie/Series
document.getElementById('sourceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const sourceData = {
    language: form.language.value,
    quality: form.quality.value,
    url: form.url.value
  };

  try {
    const res = await fetch(`${API_URL}/movies/${form.id.value}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sourceData)
    });

    const data = await res.json();

    if (res.ok) {
      alert('Source Added Successfully!');
      form.reset();
    } else {
      alert('Add Failed: ' + (data.error || JSON.stringify(data)));
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
});

// Dynamically add video source fields
function addVideoLink() {
  const container = document.getElementById('videoLinks');
  const div = document.createElement('div');
  div.classList.add('videoLink');
  div.innerHTML = `
    <input type="text" placeholder="Language" class="language" required />
    <input type="text" placeholder="Quality (e.g. 1080p)" class="quality" required />
    <input type="text" placeholder="Video URL" class="url" required />
    <button type="button" onclick="this.parentElement.remove()">Remove</button>
    <br/>
  `;
  container.appendChild(div);
}
