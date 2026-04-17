/**
 * IMPROVED DOTE SQL PARSER
 * Properly extracts college and course data
 */

const fs = require('fs');
const path = require('path');

function parseCollegeDataImproved(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return { colleges: [], courses: [] };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const collegeMap = {};
  const courseSet = new Set();
  const courseMap = {};

  // Split by INSERT statements
  const insertPattern = /INSERT INTO `.*?` VALUES \((.*?)\);/gs;
  let match;

  while ((match = insertPattern.exec(content)) !== null) {
    const valueString = match[1];
    
    // Parse individual values - handle quoted strings with commas inside
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < valueString.length; i++) {
      const char = valueString[i];
      
      if (char === "'" && (i === 0 || valueString[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
        continue;
      }
      
      current += char;
    }
    
    if (current) {
      values.push(current.trim());
    }

    // Clean values
    const cleanValues = values.map(v => {
      let val = v.trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      return val === 'NULL' ? null : val;
    });

    // Extract college code (usually f2 column, index 1)
    if (cleanValues.length >= 9 && cleanValues[1]) {
      const collegeCode = cleanValues[1];
      
      // Skip headers and totals
      if (collegeCode === 'C Code' || (collegeCode && collegeCode.includes('Total'))) {
        continue;
      }

      if (!collegeCode || collegeCode.length > 10) continue;

      const district = cleanValues[2] || '';
      const taluk = cleanValues[3] || '';  
      const collegeName = cleanValues[4] || '';
      const branchCode = cleanValues[5] || '';
      const branchName = cleanValues[6] || '';
      const intake = cleanValues[8] || '';

      // Only process valid college entries (has college code and branch info)
      if (collegeCode && collegeName && !collegeCode.includes('Sl.')) {
        // Init college if needed
        if (!collegeMap[collegeCode]) {
          collegeMap[collegeCode] = {
            code: collegeCode,
            name: collegeName,
            district: district || 'Unknown',
            taluk: taluk || '',
            branches: []
          };
        } else {
          // Update name if found (more complete entry)
          if (collegeName && collegeName.length > collegeMap[collegeCode].name.length) {
            collegeMap[collegeCode].name = collegeName;
          }
        }

        // Add branch if available
        if (branchCode && branchCode !== 'Branch Code' && intake !== '-' && intake) {
          collegeMap[collegeCode].branches.push({
            code: branchCode,
            name: branchName || '',
            intake: parseInt(intake) || 60
          });

          // Add to course list
          if (branchCode && branchName) {
            courseMap[branchCode] = branchName;
          }
        }
      }
    }
  }

  // Convert to arrays
  const colleges = Object.values(collegeMap).filter(c => c.branches.length > 0);
  const courses = Object.entries(courseMap).map(([code, name]) => ({
    code,
    name
  }));

  return { colleges, courses };
}

// Test the parser
function test() {
  console.log('\n🧪 Testing SQL Parser\n');
  console.log('📂 Parsing SQL Files:');
  
  const govtPath = path.join(__dirname, 'govt.sql');
  const sheet1Path = path.join(__dirname, 'sheet1.sql');
  const aidedPath = path.join(__dirname, 'aided.sql');

  const govtData = parseCollegeDataImproved(govtPath);
  const sheet1Data = parseCollegeDataImproved(sheet1Path);
  const aidedData = parseCollegeDataImproved(aidedPath);

  console.log(`  ✓ govt.sql: ${govtData.colleges.length} colleges, ${govtData.courses.length} courses`);
  console.log(`  ✓ sheet1.sql: ${sheet1Data.colleges.length} colleges, ${sheet1Data.courses.length} courses`);
  console.log(`  ✓ aided.sql: ${aidedData.colleges.length} colleges, ${aidedData.courses.length} courses`);

  if (govtData.colleges.length > 0) {
    console.log(`\n📍 Sample Government Colleges:`);
    govtData.colleges.slice(0, 3).forEach(c => {
      console.log(`   [${c.code}] ${c.name}`);
      console.log(`       Branches: ${c.branches.map(b => b.code).join(', ')}`);
    });
  }

  const allCourses = new Set();
  [govtData.courses, sheet1Data.courses, aidedData.courses].forEach(arr => {
    arr.forEach(c => allCourses.add(`${c.code}-${c.name}`));
  });

  console.log(`\n📚 Total Unique Courses: ${allCourses.size}`);
  console.log(`\nSample Courses:`);
  Array.from(allCourses).slice(0, 5).forEach(c => {
    console.log(`   ${c}`);
  });
}

if (require.main === module) {
  test();
}

module.exports = { parseCollegeDataImproved };
