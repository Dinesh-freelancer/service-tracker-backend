const fs = require('fs');
let content = fs.readFileSync('apps/web/src/pages/jobs/CreateJob.jsx', 'utf8');

const replacement = `            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to create job');
            }`;

content = content.replace(/if \(!res\.ok\) \{\s*throw new Error\('Failed to create job'\);\s*\}/g, replacement);

fs.writeFileSync('apps/web/src/pages/jobs/CreateJob.jsx', content, 'utf8');
