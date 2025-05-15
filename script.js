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
  const posterPath = document.getElementById('posterPath').value;
  const videoUrl = document.getElementById('videoUrl').value;
  const releaseDate = document.getElementById('releaseDate').value;
  const voteAverage = parseFloat(document.getElementById('voteAverage').value);
  const type = document.getElementById('type').value;

  // Prepare movie data object
  const movieData = {
    title,
    overview,
    category,
    posterPath,
    videoUrl,
    releaseDate,
    voteAverage,
    type
  };

  // Use XMLHttpRequest to track upload progress
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api-15hv.onrender.com/api/movies', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      uploadProgressBar.style.width = percentComplete + '%';
    }
  };

  xhr.onload = function () {
    uploadProgress.style.display = 'none';
    if (xhr.status >= 200 && xhr.status < 300) {
      const response = JSON.parse(xhr.responseText);
      movieDetails.innerHTML = `
        <h3>Movie uploaded successfully!</h3>
        <p><strong>Title:</strong> ${response.title}</p>
        <p><strong>Overview:</strong> ${response.overview}</p>
        <p><strong>Category:</strong> ${response.category}</p>
        <p><strong>Poster URL:</strong> <a href="${response.posterPath}" target="_blank">${response.posterPath}</a></p>
        <p><strong>Video URL:</strong> <a href="${response.videoUrl}" target="_blank">${response.videoUrl}</a></p>
        <p><strong>Release Date:</strong> ${response.releaseDate}</p>
        <p><strong>Vote Average:</strong> ${response.voteAverage}</p>
        <p><strong>Type:</strong> ${response.type}</p>
      `;
    } else {
      let errorMsg = 'Unknown error';
      try {
        const errorResponse = JSON.parse(xhr.responseText);
        errorMsg = errorResponse.error || errorMsg;
      } catch {}
      alert('Error: ' + errorMsg);
    }
  };

  xhr.onerror = function () {
    uploadProgress.style.display = 'none';
    alert('Network error occurred during upload.');
  };

  xhr.send(JSON.stringify(movieData));
});
