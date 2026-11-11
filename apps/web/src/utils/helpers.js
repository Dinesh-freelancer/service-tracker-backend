// Determines if the URL is a direct image link (has an image file extension)
export const isDirectImageLink = (url) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(url.split('#')[0]);
};

/**
 * Extracts and normalises the URL from either a plain URL string or an
 * <iframe ...> embed tag.  Returns a URL ready to pass to an <iframe src>.
 */
export const extractUrlFromEmbed = (embedString) => {
    if (!embedString) return '#';

    let url = embedString;

    // If the stored value is an <iframe> tag, pull out its src attribute
    if (embedString.trim().toLowerCase().startsWith('<iframe')) {
        const match =
            embedString.match(/src\s*=\s*"([^"]+)"/i) ||
            embedString.match(/src\s*=\s*'([^']+)'/i);
        if (match && match[1]) {
            url = match[1];
        }
    }

    // Google Drive: convert /view?usp=sharing → /preview  (iframe-friendly)
    if (url.includes('drive.google.com/file/d/')) {
        url = url.replace(/\/view(\?.*)?$/, '/preview');
    }

    // OneDrive personal: add action=embedview if not already an embed URL
    if (url.includes('onedrive.live.com') && !url.includes('embed')) {
        url = url.replace(/\/(view|download)\?/, '/embed?');
        if (!url.includes('action=embedview')) {
            url += (url.includes('?') ? '&' : '?') + 'action=embedview';
        }
    }

    // SharePoint / OneDrive for Business: add action=embedview
    if (
        url.includes('sharepoint.com') &&
        !url.includes('embed.aspx') &&
        !url.includes('action=embedview')
    ) {
        url += (url.includes('?') ? '&' : '?') + 'action=embedview';
    }

    return url;
};

/**
 * Returns a URL that can be used directly in an <img src> attribute.
 * For cloud-storage links that only work inside iframes this attempts to
 * derive a direct download / thumbnail URL.
 *
 * Returns null when no reliable direct-image URL can be derived – the caller
 * should then fall back to an iframe viewer.
 */
export const getDirectImageUrl = (url) => {
    if (!url || url === '#') return null;

    // Already a direct image link
    if (isDirectImageLink(url)) return url;

    // Google Drive  →  https://drive.google.com/uc?export=view&id=FILE_ID
    // Handles /file/d/ID/view, /file/d/ID/preview, /uc?id=ID, etc.
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    // OneDrive personal  →  swap embed/view for download
    if (url.includes('onedrive.live.com')) {
        return url
            .replace(/\/(embed|view|embedview)\b/, '/download')
            .replace(/action=embedview/, 'action=download');
    }

    // SharePoint / OneDrive for Business – no reliable unauthenticated transform;
    // return null so the caller shows an iframe instead.
    return null;
};
