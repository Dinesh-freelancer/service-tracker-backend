
/**
 * Verifies that the request contains the correct internal API key.
 * Expected Header: x-api-key
 */
function verifySparesApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.SPARES_SYNC_KEY;

    // If no key configured in env, fail secure (or warn in dev, but secure is better)
    if (!validKey) {
        console.error('SPARES_SYNC_KEY is not configured in environment variables.');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!apiKey || apiKey !== validKey) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    next();
}

module.exports = {
    verifySparesApiKey
};
