const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

// Use a Set to track seen pincodes
const seen = new Set();
const uniqueEntries = [];

for (const entry of data) {
    if (!seen.has(entry.Pincode)) {
        seen.add(entry.Pincode);
        
        // Create a new object without 'PostOfficeName'
        const { PostOfficeName, ...rest } = entry;
        uniqueEntries.push(rest);
    }
}

// Write the result to a new JSON file
fs.writeFileSync('unique_pincodes.json', JSON.stringify(uniqueEntries, null, 2), 'utf-8');

console.log('Duplicates removed and PostOfficeName stripped.');
