export const extractUrlFromEmbed = (embedString) => {
    if (!embedString) return '#';

    let url = embedString;

    // Check if it's an iframe tag
    if (embedString.trim().toLowerCase().startsWith('<iframe')) {
        // Regex to extract the src attribute
        const match = embedString.match(/src\s*=\s*"([^"]+)"/i) || embedString.match(/src\s*=\s*'([^']+)'/i);
        if (match && match[1]) {
            url = match[1];
        }
    }

    // Normalize Google Drive links for embedding
    // Changes /view?usp=sharing or similar to /preview
    if (url.includes('drive.google.com/file/d/')) {
        url = url.replace(/\/view.*$/, '/preview');
    }

    return url;
};

// Determines if the URL is a direct image link
export const isDirectImageLink = (url) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url.split('?')[0]);
};
