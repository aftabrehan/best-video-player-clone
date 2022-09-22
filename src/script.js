const playPauseBtn = document.querySelector('.play-pause-btn');
const theaterBtn = document.querySelector('.theater-btn');
const fullScreenBtn = document.querySelector('.full-screen-btn');
const miniPlayerBtn = document.querySelector('.mini-player-btn');
const muteBtn = document.querySelector('.mute-btn');
const volumeSlider = document.querySelector('.volume-slider');
const captionsBtn = document.querySelector('.captions-btn');
const playbackSpeedBtn = document.querySelector('.speed-btn');

const videoContainer = document.querySelector('.video-container');
const video = document.querySelector('video');

const currentTimeElement = document.querySelector('.current-time');
const totalTimeElement = document.querySelector('.total-time');

const previewImage = document.querySelector('.preview-img');
const thumbnailImage = document.querySelector('.thumbnail-img');
const timelineContainer = document.querySelector('.timeline-container');

document.addEventListener('keydown', (e) => {
    const tagName = document.activeElement.tagName.toLowerCase();

    if (tagName === 'input') {
        return;
    }

    switch (e.key.toLowerCase()) {
        case ' ':
            if (tagName === 'button') {
                return;
            }
        case 'k':
            togglePlayPause();
            break;

        case 'f':
            toggleFullScreenMode();
            break;

        case 't':
            toggleTheaterMode();
            break;

        case 'i':
            toggleMiniPlayerMode();
            break;

        case 'm':
            toggleMute();
            break;

        case 'arrowleft':
        case 'j':
            skip(-5);
            break;

        case 'arrowright':
        case 'l':
            skip(5);
            break;

        case 'c':
            toggleCaptions();
            break;
    }
});

playPauseBtn.addEventListener('click', togglePlayPause);
video.addEventListener('click', togglePlayPause);

function togglePlayPause() {
    video.paused ? video.play() : video.pause();
}

video.addEventListener('play', () => {
    videoContainer.classList.remove('paused');
});

video.addEventListener('pause', () => {
    videoContainer.classList.add('paused');
});

theaterBtn.addEventListener('click', toggleTheaterMode);

function toggleTheaterMode() {
    videoContainer.classList.toggle('theater');
}

fullScreenBtn.addEventListener('click', toggleFullScreenMode);
document.addEventListener('fullscreenchange', () => {
    videoContainer.classList.toggle('full-screen', document.fullscreenElement);
});

function toggleFullScreenMode() {
    if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

miniPlayerBtn.addEventListener('click', toggleMiniPlayerMode);

function toggleMiniPlayerMode() {
    if (videoContainer.classList.contains('mini-player')) {
        document.exitPictureInPicture();
    } else {
        video.requestPictureInPicture();
    }
}

video.addEventListener('enterpictureinpicture', () => {
    videoContainer.classList.add('mini-player');
});

video.addEventListener('leavepictureinpicture', () => {
    videoContainer.classList.remove('mini-player');
});

muteBtn.addEventListener('click', toggleMute);

function toggleMute() {
    video.muted = !video.muted;
}

volumeSlider.addEventListener('input', (e) => {
    video.volume = e.target.value;
    video.muted = e.target.value === 0;
});

video.addEventListener('volumechange', () => {
    volumeSlider.value = video.volume;

    let volumeLevel;

    if (video.muted || video.volume === 0) {
        volumeSlider.value = 0;
        volumeLevel = 'muted';
    } else if (video.volume >= 0.5) {
        volumeLevel = 'high';
    } else {
        volumeLevel = 'low';
    }

    videoContainer.dataset.volumeLevel = volumeLevel;
});

video.addEventListener('loadeddata', () => {
    totalTimeElement.textContent = formatDuration(video.duration);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
});

function formatDuration(duration) {
    const seconds = Math.floor(duration % 60);
    const minutes = Math.floor(duration / 60) % 60;
    const hours = Math.floor(duration / 3600);

    const secondsFormatted = leadingZeroFormatter.format(seconds);
    const minutesFormatted = leadingZeroFormatter.format(minutes);

    if (hours === 0) {
        return `${minutes}:${secondsFormatted}`;
    } else {
        return `${hours}:${minutesFormatted}:${secondsFormatted}`;
    }
}

video.addEventListener('timeupdate', () => {
    currentTimeElement.textContent = formatDuration(video.currentTime);

    const percent = video.currentTime / video.duration;
    timelineContainer.style.setProperty('--progress-position', percent);
});

function skip(duration) {
    video.currentTime += duration;
}

timelineContainer.addEventListener('mousemove', handleTimelineUpdate);

function handleTimelineUpdate(e) {
    const rect = timelineContainer.getBoundingClientRect();
    const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
    const previewImageNumber = Math.max(
        1,
        Math.floor((percent * video.duration) / 10)
    );
    const previewImageSrc = `../assets/previewImages/preview${previewImageNumber}.jpg`;
    previewImage.src = previewImageSrc;
    timelineContainer.style.setProperty('--preview-position', percent);

    if (isScrubbing) {
        e.preventDefault();
        thumbnailImage.src = previewImageSrc;
        timelineContainer.style.setProperty('--progress-position', percent);
    }
}

timelineContainer.addEventListener('mousedown', toggleScrubbing);

let isScrubbing = false;

function toggleScrubbing(e) {
    const rect = timelineContainer.getBoundingClientRect();
    const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

    isScrubbing = (e.buttons & 1) == 1;
    videoContainer.classList.toggle('scrubbing', isScrubbing);

    if (isScrubbing) {
        wasPaused = video.paused;
        video.pause();
    } else {
        video.currentTime = percent * video.duration;

        if (!wasPaused) {
            video.play();
        }
    }

    handleTimelineUpdate(e);
}

document.addEventListener('mouseup', (e) => {
    if (isScrubbing) {
        toggleScrubbing(e);
    }
});

function hideCaptionsButton() {
    captionsBtn.style.display = 'none';
}

const captions = video.textTracks[0];
captions.mode = 'hidden';

captionsBtn.addEventListener('click', toggleCaptions);

function toggleCaptions() {
    const isHidden = captions.mode === 'hidden';
    captions.mode = isHidden ? 'showing' : 'hidden';
    videoContainer.classList.toggle('captions', isHidden);
}

playbackSpeedBtn.addEventListener('click', changePlaybackSpeed);

function changePlaybackSpeed() {
    let newPlaybackRate = video.playbackRate + 0.25;

    if (newPlaybackRate > 2) {
        newPlaybackRate = 0.25;
    }

    video.playbackRate = newPlaybackRate;
    playbackSpeedBtn.textContent = `${newPlaybackRate}x`;
}
