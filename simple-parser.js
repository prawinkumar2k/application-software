/**
 * SIMPLE DOTE DATA EXTRACTOR
 * Direct extraction without complex regex
 */

const fs = require('fs');
const path = require('path');

function extractCollegeData(filePath) {
  const colleges = new Map();
  const courses = new Map();

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    // Only process INSERT lines
    if (!line.includes('INSERT INTO')) continue;

    // Extract VALUES section
    const valuesMatch = line.match(/VALUES\s*\(([^)]+)\)/);
    if (!valuesMatch) continue;

    const valuesStr = valuesMatch[1];
    
    // Split by comma, but respect quoted strings
    const values = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];

      if (char === "'" && valuesStr[i-1] !== '\\') {
        inQuote = !inQuote;
        current += char;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      values.push(current.trim());
    }

    // Clean quoted values
    const cleaned = values.map(v => {
      let val = v.trim();
      if (val === 'NULL') return null;
      if (val.startsWith("'") && val.endsWith("'")) {
        return val.slice(1, -1);
      }
      return val;
    });

    // Guard: need at least 10 columns
    if (cleaned.length < 10) continue;

    const [f1, collegeCode, district, taluk, collegeName, branchCode, branchName, branchType, intake, intake2] = cleaned;

    // Skip headers
    if (!collegeCode || collegeCode === 'C Code' || collegeCode === 'Sl. No') continue;
    if (collegeCode.includes('Total')) continue;

    // Skip if no branch
    if (!branchCode || branchCode === 'Branch Code') continue;

    // Skip if intake is dash
   if (intake === '-' || !intake) continue;

    // Valid entry - add college
    const key = collegeCode;
    if (!colleges.has(key)) {
      colleges.set(key, {
        code: collegeCode,
        name: collegeName,
        district: district || 'Unknown',
        taluk: taluk || '',
        branches: []
      });
    }

    const college = colleges.get(key);
    
    // Add branch
    college.branches.push({
      code: branchCode,
      name: branchName || '',
      intake: parseInt(intake) || 60
    });

    // Add course
    if (branchCode && branchName) {
      if (!courses.has(branchCode)) {
        courses.set(branchCode, branchName);
      }
    }
  }

  // Convert to arrays, filter colleges with branches
  const collegeArray = Array.from(colleges.values()).filter(c => c.branches.length > 0);
  const courseArray = Array.from(courses.entries()).map(([code, name]) => ({ code, name }));

  return { colleges: collegeArray, courses: courseArray };
}

// Test
console.log('\n🔍 TESTING IMPROVED PARSER\n');
console.log('Reading SQL files from:', __dirname);
console.log('Current working directory:', process.cwd());

const govtPath = path.join(__dirname, 'govt.sql');
const sheet1Path = path.join(__dirname, 'sheet1.sql');
const aidedPath = path.join(__dirname, 'aided.sql');

console.log(`\nChecking files:`);
console.log(`  govt.sql exists: ${fs.existsSync(govtPath)}`);
console.log(`  sheet1.sql exists: ${fs.existsSync(sheet1Path)}`);
console.log(`  aided.sql exists: ${fs.existsSync(aidedPath)}\n`);

console.log('📂 Parsing SQL Files:');

const govtData = extractCollegeData(govtPath);
const sheet1Data = extractCollegeData(sheet1Path);
const aidedData = extractCollegeData(aidedPath);

console.log(`  ✓ govt.sql: ${govtData.colleges.length} colleges, ${govtData.courses.length} courses`);
console.log(`  ✓ sheet1.sql: ${sheet1Data.colleges.length} colleges, ${sheet1Data.courses.length} courses`);
console.log(`  ✓ aided.sql: ${aidedData.colleges.length} colleges, ${aidedData.courses.length} courses`);

// Merge all
const allColleges = new Map();
const allCourses = new Map();

[govtData, sheet1Data, aidedData].forEach(data => {
  data.colleges.forEach(c => {
    if (!allColleges.has(c.code)) {
      allColleges.set(c.code, c);
    }
  });
  data.courses.forEach(c => {
    if (!allCourses.has(c.code)) {
      allCourses.set(c.code, c);
    }
  });
});

console.log(`\n📊 TOTAL DATA:`);
console.log(`  Colleges: ${allColleges.size}`);
console.log(`  Courses: ${allCourses.size}\n`);

if (govtData.colleges.length > 0) {
  console.log(`📍 Sample Government Colleges:`);
  govtData.colleges.slice(0, 3).forEach(c => {
    console.log(`   [${c.code}] ${c.name.substring(0, 50)}`);
    console.log(`       District: ${c.district}`);
    console.log(`       Branches (${c.branches.length}): ${c.branches.slice(0, 3).map(b => b.code).join(', ')}...`);
  });
}

console.log(`\n📚 Sample Courses:`);
Array.from(allCourses.values()).slice(0, 8).forEach(c => {
  console.log(`   [${c.code}] ${c.name.substring(0, 60)}`);
});

console.log('\n✅ Parser test complete!\n');
