const API_URL = 'https://api-15hv.onrender.com/api';

// Wrap all event listeners inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Navigation for sidebar links
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

  // Upload Movie/Series
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
      ${(Array.isArray(uploaded.videoLinks) ? uploaded.videoLinks : []).map(source => `<li>${source.quality} - ${source.language} - <a href="${source.url}" target="_blank">${source.url}</a></li>`).join('')}
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

  function collectEpisodeVideoSources() {
    const sources = [];
    const containers = document.querySelectorAll('.episode-video-source');
    containers.forEach(container => {
      const quality = container.querySelector('.quality').value;
      const language = container.querySelector('.language').value;
      const url = container.querySelector('.url').value;
      if (quality && language && url) {
        sources.push({ quality, language, url });
      }
    });
    return sources;
  }

  document.getElementById('episode-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const episodeData = {
      title: form.episodeTitle.value,
      overview: form.episodeOverview.value,
      seriesId: form.seriesId.value,
      episodeNumber: parseInt(form.episodeNumber.value),
      releaseDate: form.episodeReleaseDate ? form.episodeReleaseDate.value : undefined,
      videoSources: collectEpisodeVideoSources()
    };

    console.log("Sending episode data:", episodeData);

    try {
      const res = await fetch(`${API_URL}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(episodeData)
      });

      const result = await res.json();

      if (res.ok) {
        document.getElementById('episodeStatus').innerText = `Episode "${result.title || (result.episode && result.episode.title) || 'Unknown'}" uploaded successfully.`;
        form.reset();
      } else {
        throw new Error(result.error || 'Failed to upload episode.');
      }
    } catch (err) {
      document.getElementById('episodeStatus').innerText = 'Error: ' + err.message;
    }
  });

  // Add Video Source to Existing Movie/Series
  async function populateMovieTitles() {
    try {
      console.log('Fetching movies...');
      const res = await fetch(`${API_URL}/movies/all`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const movies = await res.json();

      console.log('Movies received:', movies);

      if (!Array.isArray(movies)) throw new Error('Movies is not an array');

      const select = document.getElementById('existingTitle');
      if (!select) throw new Error('Dropdown element not found');

      select.innerHTML = '<option value="">-- Select Movie --</option>';

      movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie._id;
        option.textContent = movie.title;
        select.appendChild(option);
      });

    } catch (error) {
      console.error('Error fetching movie titles:', error);
      alert('Could not load movie titles. Check console for error.');
    }
  }

  populateMovieTitles();

  document.getElementById('videoSourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const movieId = document.getElementById('existingTitle').value;
    const quality = document.getElementById('newQuality').value;
    const language = document.getElementById('newLanguage').value;
    const url = document.getElementById('newUrl').value;

    try {
      const res = await fetch(`${API_URL}/movies/${movieId}/add-source`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoSource: { quality, language, url } })
      });

      const result = await res.json();

      if (res.ok) {
        alert(`Video source added to "${result.movie?.title || 'Unknown'}" successfully.`);
        document.getElementById('videoSourceForm').reset();
      } else {
        throw new Error(result.error || 'Failed to add video source.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Add Video Source button function
  function addVideoSource() {
    const container = document.getElementById('videoSources');
    const sourceDiv = document.createElement('div');
    sourceDiv.classList.add('video-source');
    sourceDiv.innerHTML = `
      <input type="text" placeholder="Quality (e.g., 1080p)" class="quality" required />
      <input type="text" placeholder="Language (e.g., Hindi)" class="language" required />
      <input type="text" placeholder="Video URL" class="url" required />
      <button type="button" onclick="this.parentElement.remove()">Remove</button>
      <br/>
    `;
    container.appendChild(sourceDiv);
  }
  window.addVideoSource = addVideoSource;

  // Add Episode Video Source button function
  function addEpisodeVideoSource() {
    const container = document.getElementById('episodeVideoSources');
    const sourceDiv = document.createElement('div');
    sourceDiv.classList.add('episode-video-source');
    sourceDiv.innerHTML = `
      <input type="text" placeholder="Video URL" class="url" required />
      <input type="text" placeholder="Language" class="language" required />
      <input type="text" placeholder="Quality" class="quality" required />
      <button type="button" onclick="removeEpisodeVideoSource(this)">Remove</button>
      <br/>
    `;
    container.appendChild(sourceDiv);
  }
  window.addEpisodeVideoSource = addEpisodeVideoSource;

  function removeEpisodeVideoSource(button) {
    button.parentElement.remove();
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
});
// Analytics loading function
async function loadAnalytics() {
  try {
    const res = await fetch(`${API_URL}/analytics`);
    const events = await res.json();

    const tableBody = document.querySelector('#analyticsTable tbody');
    tableBody.innerHTML = '';

    if (events.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3">No analytics events yet.</td></tr>`;
      return;
    }

    events.forEach(event => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(event.timestamp).toLocaleString()}</td>
        <td>${event.event}</td>
        <td><pre style="white-space: pre-wrap; text-align:left;">${JSON.stringify(event.details, null, 2)}</pre></td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (err) {
    alert('Failed to load analytics: ' + err.message);
    console.error(err);
  }
}

// Load analytics when Analytics tab is clicked
document.querySelector('a[data-target="analyticsSection"]').addEventListener('click', () => {
  loadAnalytics();
});
// new updated   

document.addEventListener("DOMContentLoaded", () => {
  // When analytics section is shown
  document.querySelector("a[data-target='analyticsSection']").addEventListener("click", () => {
    fetchAnalytics();
    fetchCrashReports();
  });
});

function fetchAnalytics() {
  fetch("/api/app-stats")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("totalInstalls").textContent = data.totalInstalls || 0;
      document.getElementById("totalVisits").textContent = data.totalVisits || 0;
      document.getElementById("todayVisits").textContent = data.todayVisits || 0;
      document.getElementById("totalMoviePlays").textContent = data.totalMoviePlays || 0;
    })
    .catch((err) => {
      console.error("Failed to load analytics:", err);
    });
}

function fetchCrashReports() {
  fetch("/api/crashes")
    .then((res) => res.json())
    .then((reports) => {
      const tableBody = document.querySelector("#crashReportsTable tbody");
      tableBody.innerHTML = "";
      reports.forEach((report) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(report.createdAt).toLocaleString()}</td>
          <td>${report.message || ""}</td>
          <td>${report.platform || ""}</td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("Failed to load crash reports:", err);
    });
}
