const fs = require('fs');
let content = fs.readFileSync('apps/api/controllers/serviceRequestController.js', 'utf8');

content = content.replace(
    /return res\.status\(400\)\.json\(\{ error: 'Invalid Job Number format\. Must be YYYYMMDDNNN\.' \}\);/g,
    "throw new Error('Invalid Job Number format. Must be YYYYMMDDNNN.');"
);

content = content.replace(
    /return res\.status\(400\)\.json\(\{ error: 'Job Number already exists\. Please choose another one\.' \}\);/g,
    "throw new Error('Job Number already exists. Please choose another one.');"
);

fs.writeFileSync('apps/api/controllers/serviceRequestController.js', content, 'utf8');
