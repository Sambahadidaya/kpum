// Helper untuk parsing URL YouTube menjadi embed format yang aman

export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const trimmed = url.trim();

    // Sudah format embed
    if (trimmed.includes('youtube.com/embed/') || trimmed.includes('youtube-nocookie.com/embed/')) {
      return trimmed;
    }

    let videoId = null;

    // Format https://youtu.be/ID
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch && shortMatch[1]) {
      videoId = shortMatch[1];
    }

    // Format https://www.youtube.com/watch?v=ID
    if (!videoId) {
      const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (watchMatch && watchMatch[1]) {
        videoId = watchMatch[1];
      }
    }

    // Format https://www.youtube.com/shorts/ID
    if (!videoId) {
      const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch && shortsMatch[1]) {
        videoId = shortsMatch[1];
      }
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    }

    return null;
  } catch (error) {
    return null;
  }
}
