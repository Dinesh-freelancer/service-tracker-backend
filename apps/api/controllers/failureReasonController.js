const pool = require('../db');

async function getFailureReasons(req, res, next) {
    try {
        const [rows] = await pool.query(
            "SELECT DISTINCT FailureReason FROM servicerequest WHERE FailureReason IS NOT NULL AND FailureReason != ''"
        );
        res.json(rows.map(r => r.FailureReason));
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getFailureReasons
};
