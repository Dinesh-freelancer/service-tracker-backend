export const extractUrlFromEmbed = (embedString) => {
    if (!embedString) return '#';

    // Check if it's an iframe tag
    if (embedString.trim().toLowerCase().startsWith('<iframe')) {
        // Regex to extract the src attribute
        const match = embedString.match(/src\s*=\s*"([^"]+)"/i) || embedString.match(/src\s*=\s*'([^']+)'/i);
        if (match && match[1]) {
            return match[1];
        }
    }

    // If it's already a URL (or we couldn't parse the iframe), return it as is
    return embedString;
};
