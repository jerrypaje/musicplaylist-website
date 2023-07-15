var playlist = [];
var currentSongIndex = 0;

document.getElementById("add-song-form").addEventListener("submit", function(e) {
  e.preventDefault();

  var songFile = document.getElementById("song-file").files[0];

  if (songFile) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var songURL = event.target.result;
      addSongToPlaylist(songURL, songFile.name);
    };
    reader.readAsDataURL(songFile);
  }

  document.getElementById("song-file").value = "";
});

function addSongToPlaylist(songURL, songName) {
  var song = new Audio(songURL);
  var songItem = { name: songName, audio: song };
  playlist.push(songItem);

  if (playlist.length === 1) {
    playSong(0);
  }

  updatePlaylist();
}

function updatePlaylist() {
  var songsList = document.getElementById("songs-list");
  songsList.innerHTML = "";

  for (var i = 0; i < playlist.length; i++) {
    var songItem = playlist[i];
    var li = document.createElement("li");
    li.innerText = songItem.name;

    songsList.appendChild(li);
  }
}

function generateMusicWave() {
    var canvas = document.getElementById("music-wave");
    var context = canvas.getContext("2d");
    
    var currentSong = playlist[currentSongIndex].audio;
    var audioContext = new AudioContext();
    var source = audioContext.createMediaElementSource(currentSong);
    var analyser = audioContext.createAnalyser();
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    function drawWave() {
      var drawVisual = requestAnimationFrame(drawWave);
      
      analyser.getByteTimeDomainData(dataArray);
      
      context.fillStyle = "#000000";
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.lineWidth = 2;
      context.strokeStyle = "#ffffff";
      
      context.beginPath();
      
      var sliceWidth = canvas.width * 1.0 / bufferLength;
      var x = 0;
      
      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * canvas.height / 2;
        
        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      context.lineTo(canvas.width, canvas.height / 2);
      context.stroke();
    }
    
    drawWave();
  }
function playSong(index) {
  if (index >= 0 && index < playlist.length) {
    var songItem = playlist[index];

    if (currentSongIndex !== index) {
      stopCurrentSong();
      currentSongIndex = index;
    }

    songItem.audio.play();
    songItem.audio.addEventListener("ended", playNextSong);

    generateMusicWave();
  }
}

function stopCurrentSong() {
  if (currentSongIndex >= 0 && currentSongIndex < playlist.length) {
    var currentSong = playlist[currentSongIndex].audio;
    currentSong.pause();
    currentSong.currentTime = 0;
    currentSong.removeEventListener("ended", playNextSong);
  }
}

function playNextSong() {
  stopCurrentSong();

  if (playlist.length > 0) {
    playlist.splice(currentSongIndex, 1);
    if (currentSongIndex >= playlist.length) {
      currentSongIndex = 0;
    }
    updatePlaylist();
    playSong(currentSongIndex);
  }
}