const OMDB_API_KEY = '6ab15f18';
const BACKEND_API_URL = 'https://your-api.onrender.com/api/movies'; // replace with your actual API endpoint

async function fetchOmdbData() {
  const title = document.getElementById('title').value;
  const releaseDate = document.getElementById('releaseDate').value;
  let year = '';

  if (!title) {
    alert("Please enter a movie title.");
    return;
  }

  if (releaseDate) {
    year = new Date(releaseDate).getFullYear();
  }

  const url = year
    ? `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${OMDB_API_KEY}`
    : `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      document.getElementById('omdbPoster').src = data.Poster;
      document.getElementById('posterUrl').value = data.Poster || '';
      document.getElementById('title').value = data.Title || '';
      document.getElementById('voteAverage').value = data.imdbRating || '';
      // Set category, type, and region if available in OMDb data or set defaults
      document.getElementById('category').value = data.Genre ? data.Genre.split(',')[0].trim() : '';
      document.getElementById('type').value = data.Type || 'movie';
      document.getElementById('region').value = 'Hollywood'; // Default region as OMDb does not provide region info
      document.getElementById('omdbTitle').innerText = data.Title;
      document.getElementById('omdbYear').innerText = data.Year;
      document.getElementById('omdbRating').innerText = data.imdbRating;
      document.getElementById('omdbPreview').style.display = 'block';
    } else {
      // Instead of alert, show message in the preview area
      document.getElementById('omdbTitle').innerText = 'Data not available';
      document.getElementById('omdbYear').innerText = 'Data not available';
      document.getElementById('omdbRating').innerText = 'Data not available';
      document.getElementById('omdbPoster').src = '';
      document.getElementById('omdbPreview').style.display = 'block';
    }
  } catch (err) {
    console.error("Error fetching OMDb data:", err);
    alert("Failed to fetch from OMDb.");
    document.getElementById('omdbPreview').style.display = 'none';
  }
}

document.getElementById('movieForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const movieData = {
    title: document.getElementById('title').value,
    overview: document.getElementById('overview').value,
    category: document.getElementById('category').value,
    type: document.getElementById('type').value,
    region: document.getElementById('region').value,
    release_date: document.getElementById('releaseDate').value,
    videoUrl: document.getElementById('videoUrl').value,
    vote_average: parseFloat(document.getElementById('voteAverage').value) || undefined,
  };

  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movieData),
    });

    if (response.ok) {
      alert('Movie uploaded successfully!');
      document.getElementById('movieForm').reset();
      document.getElementById('omdbPreview').style.display = 'none';
    } else {
      alert('Upload failed.');
    }
  } catch (err) {
    console.error('Error uploading movie:', err);
    alert('Error uploading movie.');
  }
});
