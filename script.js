const API_URL = 'https://api-15hv.onrender.com/api';

// Upload Movie/Series
document.getElementById('movieForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  const videoLinkDivs = document.querySelectorAll('.videoLink');
  const videoLinks = Array.from(videoLinkDivs).map(div => ({
    language: div.querySelector('.language').value,
    quality: div.querySelector('.quality').value,
    url: div.querySelector('.url').value
  }));

  const movieData = {
    title: form.title.value,
    overview: form.overview.value,
    category: form.category.value,
    poster: form.poster.value,
    releaseDate: form.releaseDate.value,
    voteAverage: parseFloat(form.voteAverage.value),
    region: form.region.value,
    type: form.type.value,
    videoLinks: videoLinks
  };

  const res = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movieData)
  });

  alert(res.ok ? 'Movie/Series Uploaded!' : 'Upload Failed');
  form.reset();
  document.getElementById('videoLinks').innerHTML = '';
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

  const res = await fetch(`${API_URL}/episodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(episodeData)
  });

  alert(res.ok ? 'Episode Uploaded!' : 'Upload Failed');
  form.reset();
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

  const res = await fetch(`${API_URL}/movies/${form.id.value}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sourceData)
  });

  alert(res.ok ? 'Source Added!' : 'Add Failed');
  form.reset();
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
