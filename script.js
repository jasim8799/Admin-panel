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
  const posterFile = document.getElementById('poster').files[0];
  const posterUrl = document.getElementById('posterUrl').value.trim();
  const videoUrl = document.getElementById('videoUrl').value;
  const releaseDate = document.getElementById('releaseDate').value;
  const voteAverage = parseFloat(document.getElementById('voteAverage').value);
  const type = document.getElementById('type').value;

  // Validate that either poster file or poster URL is provided
  if (!posterFile && !posterUrl) {
    alert('Please provide either a poster image file or a poster image URL.');
    uploadProgress.style.display = 'none';
    return;
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append('title', title);
  formData.append('overview', overview);
  formData.append('category', category);
  if (posterFile) {
    formData.append('poster', posterFile);
  } else {
    formData.append('posterUrl', posterUrl);
  }
  formData.append('videoUrl', videoUrl);
  formData.append('releaseDate', releaseDate);
  formData.append('voteAverage', voteAverage);
  formData.append('type', type);

  // Use XMLHttpRequest to track upload progress
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api-15hv.onrender.com/api/movies', true);
  // Do not set Content-Type header; browser will set it automatically for FormData

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

  xhr.send(formData);
});
