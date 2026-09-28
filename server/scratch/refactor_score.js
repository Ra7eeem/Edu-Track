const fs = require('fs');
const path = require('path');

const directory = 'd:\\realy-projects\\edu-track\\server\\src';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(directory).filter(f => f.endsWith('.ts') || f.endsWith('.json'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace MonthlyScore with StudentScore
    content = content.replace(/MonthlyScore/g, 'StudentScore');
    content = content.replace(/monthlyScore/g, 'studentScore');
    content = content.replace(/IMonthlyScore/g, 'IStudentScore');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});

// Rename the model file
const oldModelPath = path.join(directory, 'models', 'MonthlyScore.ts');
const newModelPath = path.join(directory, 'models', 'StudentScore.ts');
if (fs.existsSync(oldModelPath)) {
    fs.renameSync(oldModelPath, newModelPath);
    console.log('Renamed model file');
}
