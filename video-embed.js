// Video Embed Utilities
// Handles YouTube, Vimeo, and direct video files

// Extract YouTube video ID
function getYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Extract Vimeo video ID
function getVimeoVideoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
}

// Check if URL is YouTube
function isYouTube(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// Check if URL is Vimeo
function isVimeo(url) {
    return url.includes('vimeo.com');
}

// Check if URL is direct video file
function isDirectVideo(url) {
    return /\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(url);
}

// Generate YouTube embed URL
function getYouTubeEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

// Generate Vimeo embed URL
function getVimeoEmbedUrl(videoId) {
    return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
}

// Create video embed HTML
function createVideoEmbed(videoUrl, poster = '') {
    if (!videoUrl) return '';
    
    // YouTube
    if (isYouTube(videoUrl)) {
        const videoId = getYouTubeVideoId(videoUrl);
        if (videoId) {
            return `
                <div class="video-container">
                    <iframe 
                        src="${getYouTubeEmbedUrl(videoId)}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        loading="lazy"
                        title="Video player">
                    </iframe>
                </div>
            `;
        }
    }
    
    // Vimeo
    if (isVimeo(videoUrl)) {
        const videoId = getVimeoVideoId(videoUrl);
        if (videoId) {
            return `
                <div class="video-container">
                    <iframe 
                        src="${getVimeoEmbedUrl(videoId)}" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen
                        loading="lazy"
                        title="Video player">
                    </iframe>
                </div>
            `;
        }
    }
    
    // Direct video file
    if (isDirectVideo(videoUrl)) {
        return `
            <div class="video-container">
                <video 
                    controls 
                    poster="${poster || ''}" 
                    preload="metadata"
                    playsinline>
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }
    
    // Fallback: try as direct video
    return `
        <div class="video-container">
            <video 
                controls 
                poster="${poster || ''}" 
                preload="metadata"
                playsinline>
                <source src="${videoUrl}">
                Your browser does not support the video tag.
            </video>
        </div>
    `;
}

// Make available globally
window.createVideoEmbed = createVideoEmbed;
window.getYouTubeVideoId = getYouTubeVideoId;
window.getVimeoVideoId = getVimeoVideoId;
window.isYouTube = isYouTube;
window.isVimeo = isVimeo;
window.isDirectVideo = isDirectVideo;
