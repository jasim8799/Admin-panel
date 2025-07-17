const API_URL = 'https://api-15hv.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.sidebar nav ul li a');
  const sections = document.querySelectorAll('.main-content section');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetId = link.getAttribute('data-target');
      sections.forEach(section => {
        section.style.display = (section.id === targetId) ? 'block' : 'none';
      });

      if (targetId === 'analyticsSection') {
        fetchAnalytics();
        fetchCrashReports();
      }
    });
  });

  populateMovieTitles();

  document.getElementById('movie-form').addEventListener('submit', handleMovieUpload);
  document.getElementById('episode-form').addEventListener('submit', handleEpisodeUpload);
  document.getElementById('videoSourceForm').addEventListener('submit', handleVideoSourceUpload);
});

function handleMovieUpload(event) {
  event.preventDefault();

  const uploadProgress = document.getElementById('uploadProgress');
  const uploadProgressBar = document.getElementById('uploadProgressBar');
  const movieDetails = document.getElementById('movieDetails');

  movieDetails.innerHTML = '';
  uploadProgressBar.style.width = '0%';
  uploadProgress.style.display = 'block';

  const videoLinks = Array.from(document.querySelectorAll('#videoSources .video-source')).map(source => ({
    quality: source.querySelector('.quality').value.trim(),
    language: source.querySelector('.language').value.trim(),
    url: source.querySelector('.url').value.trim()
  }));

  const movieData = {
    title: document.getElementById('title').value,
    overview: document.getElementById('overview').value,
    category: document.getElementById('category').value,
    region: document.getElementById('region').value,
    posterPath: document.getElementById('posterUrl').value.trim(),
    videoLinks,
    releaseDate: document.getElementById('releaseDate').value,
    voteAverage: parseFloat(document.getElementById('voteAverage').value),
    type: document.getElementById('type').value
  };

  const endpoint = movieData.type === 'Movie' ? `${API_URL}/movies` : `${API_URL}/series`;

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movieData)
  })
    .then(response => response.json())
    .then(data => {
      uploadProgress.style.display = 'none';
      const uploaded = data.movie || data.series || data.data;
      if (uploaded) {
        movieDetails.innerHTML = `
          <h3>${movieData.type} uploaded successfully!</h3>
          <p><strong>Title:</strong> ${uploaded.title}</p>
          <p><strong>Overview:</strong> ${uploaded.overview}</p>
          <p><strong>Category:</strong> ${uploaded.category}</p>
          <p><strong>Region:</strong> ${uploaded.region}</p>
          <p><strong>Poster URL:</strong> <a href="${uploaded.posterPath}" target="_blank">${uploaded.posterPath}</a></p>
          <p><strong>Video Sources:</strong></p>
          <ul>
            ${(Array.isArray(uploaded.videoLinks) ? uploaded.videoLinks : []).map(source =>
              `<li>${source.quality} - ${source.language} - <a href="${source.url}" target="_blank">${source.url}</a></li>`
            ).join('')}
          </ul>
          <p><strong>Release Date:</strong> ${uploaded.releaseDate}</p>
          <p><strong>Vote Average:</strong> ${uploaded.voteAverage}</p>
          <p><strong>Type:</strong> ${uploaded.type}</p>
        `;

        // Track play event for analytics
        fetch(`${API_URL}/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'play',
            details: {
              title: uploaded.title,
              type: uploaded.type
            }
          })
        }).catch(err => console.warn('Analytics tracking failed:', err));
      } else {
        alert('Error: Invalid response from server.');
      }
    })
    .catch(err => {
      uploadProgress.style.display = 'none';
      alert(`An error occurred: ${err.message}`);
    });
}

function handleEpisodeUpload(e) {
  e.preventDefault();
  const form = e.target;

  const episodeData = {
    title: form.episodeTitle.value,
    overview: form.episodeOverview.value,
    seriesId: form.seriesId.value,
    episodeNumber: parseInt(form.episodeNumber.value),
    videoSources: collectEpisodeVideoSources()
  };

  fetch(`${API_URL}/episodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(episodeData)
  })
    .then(res => res.json())
    .then(result => {
      if (result && result.title) {
        document.getElementById('episodeStatus').textContent = `Episode "${result.title}" uploaded successfully.`;
        form.reset();
      } else {
        throw new Error(result.error || 'Failed to upload episode.');
      }
    })
    .catch(err => {
      document.getElementById('episodeStatus').textContent = `Error: ${err.message}`;
    });
}

function handleVideoSourceUpload(e) {
  e.preventDefault();

  const movieId = document.getElementById('existingTitle').value;
  const quality = document.getElementById('newQuality').value;
  const language = document.getElementById('newLanguage').value;
  const url = document.getElementById('newUrl').value;

  fetch(`${API_URL}/movies/${movieId}/add-source`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoSource: { quality, language, url } })
  })
    .then(res => res.json())
    .then(result => {
      if (result && result.movie) {
        alert(`Video source added to "${result.movie.title}" successfully.`);
        document.getElementById('videoSourceForm').reset();
      } else {
        throw new Error(result.error || 'Failed to add video source.');
      }
    })
    .catch(err => {
      alert(`Error: ${err.message}`);
    });
}

function populateMovieTitles() {
  fetch(`${API_URL}/movies/all`)
    .then(res => res.json())
    .then(movies => {
      const select = document.getElementById('existingTitle');
      select.innerHTML = '<option value="">-- Select Movie --</option>';
      movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie._id;
        option.textContent = movie.title;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Could not load movie titles:', err);
    });
}

function collectEpisodeVideoSources() {
  return Array.from(document.querySelectorAll('.episode-video-source')).map(container => ({
    quality: container.querySelector('.quality').value,
    language: container.querySelector('.language').value,
    url: container.querySelector('.url').value
  }));
}

function addVideoSource() {
  const container = document.createElement('div');
  container.classList.add('video-source');
  container.innerHTML = `
    <input type="text" placeholder="Quality (e.g., 1080p)" class="quality" required />
    <input type="text" placeholder="Language (e.g., Hindi)" class="language" required />
    <input type="text" placeholder="Video URL" class="url" required />
    <button type="button" onclick="this.parentElement.remove()">Remove</button>
    <br/>
  `;
  document.getElementById('videoSources').appendChild(container);
}
window.addVideoSource = addVideoSource;

function addEpisodeVideoSource() {
  const container = document.createElement('div');
  container.classList.add('episode-video-source');
  container.innerHTML = `
    <input type="text" placeholder="Video URL" class="url" required />
    <input type="text" placeholder="Language" class="language" required />
    <input type="text" placeholder="Quality" class="quality" required />
    <button type="button" onclick="removeEpisodeVideoSource(this)">Remove</button>
    <br/>
  `;
  document.getElementById('episodeVideoSources').appendChild(container);
}
window.addEpisodeVideoSource = addEpisodeVideoSource;

function removeEpisodeVideoSource(button) {
  button.parentElement.remove();
}

function fetchAnalytics() {
  fetch(`${API_URL}/analytics/summary`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('totalInstalls').textContent = data.totalInstalls || 0;
      document.getElementById('totalVisits').textContent = data.totalViews || 0;
      document.getElementById('todayVisits').textContent = data.todayViews || 0;
      document.getElementById('totalMoviePlays').textContent = data.totalPlays || 0;
    })
    .catch(err => {
      console.error('Failed to load analytics summary:', err);
    });
}

function fetchCrashReports() {
  fetch(`${API_URL}/crashes`)
    .then(res => res.json())
    .then(reports => {
      const tableBody = document.querySelector('#crashReportsTable tbody');
      tableBody.innerHTML = '';
      reports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${new Date(report.createdAt).toLocaleString()}</td>
          <td>${report.message || ''}</td>
          <td>${report.platform || ''}</td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(err => {
      console.error('Failed to load crash reports:', err);
    });
}

