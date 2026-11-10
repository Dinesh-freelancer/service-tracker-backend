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

    // Normalize OneDrive personal sharing links for embedding
    // e.g. https://onedrive.live.com/...?resid=...&authkey=... -> embed URL
    if (url.includes('onedrive.live.com') && !url.includes('embed')) {
        // Convert view/download links to embed links
        url = url.replace(/\/(view|download)\?/, '/embed?').replace(/\?.*$/, (match) => {
            // Keep query params but switch action to embed
            return match.replace(/action=[^&]*/, 'action=embedview');
        });
        // If no action param, append embedview
        if (!url.includes('action=embedview') && !url.includes('embed')) {
            url = url + (url.includes('?') ? '&' : '?') + 'action=embedview';
        }
    }

    // Normalize OneDrive short share links (1drv.ms) — leave as-is; they redirect correctly
    // Normalize SharePoint/OneDrive for Business document links for embedding
    // e.g. https://tenant.sharepoint.com/:w:/s/site/FILE -> embed format
    if (
        (url.includes('sharepoint.com') || url.includes('-my.sharepoint.com')) &&
        !url.includes('embed.aspx') &&
        !url.includes('action=embedview')
    ) {
        // Replace /:x:/ sharing prefix paths with the embed viewer
        // Convert standard view URLs to &action=embedview
        if (url.includes('/_layouts/')) {
            // Already a layouts URL, try adding embedview param
            url = url + (url.includes('?') ? '&' : '?') + 'action=embedview';
        } else if (url.match(/\/:.\//)) {
            // Short-form sharing URL — append embedview
            url = url + (url.includes('?') ? '&' : '?') + 'action=embedview';
        }
    }

    return url;
};

// Determines if the URL is a direct image link
export const isDirectImageLink = (url) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url.split('?')[0]);
};
