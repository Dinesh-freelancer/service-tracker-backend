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

    let url = embedString.trim();

    // If the stored value is an <iframe> or <img> tag, pull out its src attribute
    if (
        url.toLowerCase().startsWith('<iframe') ||
        url.toLowerCase().startsWith('<img')
    ) {
        const match =
            url.match(/src\s*=\s*"([^"]+)"/i) ||
            url.match(/src\s*=\s*'([^']+)'/i);
        if (match && match[1]) {
            url = match[1].replace(/&amp;/gi, '&');
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

    // Google Drive  →  thumbnail endpoint works directly in <img src>
    // (drive.google.com/uc?export=view is blocked by Google's CORP/ORB policy in <img> tags)
    const driveMatch =
        url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        url.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?.*?\bid=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
    }

    // OneDrive personal  →  /embed URLs for photos serve the image directly in <img>
    // (swapping /embed to /download fails in <img>; strip action=embedview if added)
    if (url.includes('onedrive.live.com')) {
        return url
            .replace(/\/(view|download)\b/, '/embed')
            .replace(/([?&])action=(embedview|download)(&|$)/, (m, p1, _p2, p3) =>
                p3 === '&' ? p1 : ''
            );
    }

    // SharePoint / OneDrive for Business – no reliable unauthenticated transform;
    // return null so the caller shows an iframe instead.
    return null;
};
