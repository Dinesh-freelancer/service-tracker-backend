const fs = require('fs');
const text = fs.readFileSync('Tables.sql', 'utf8');
const regex = /CREATE TABLE IF NOT EXISTS `assets` \([\s\S]*?ENGINE=InnoDB/g;
console.log(text.match(regex)[0]);
