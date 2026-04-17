/**
 * DOTE SQL DATA PARSER
 * Extracts college & course data from all SQL files
 */

const fs = require('fs');
const path = require('path');

// Helper to parse SQL INSERT statements
function parseInsertValues(sqlLine) {
  const match = sqlLine.match(/VALUES\s*\((.*?)\)\s*;/i);
  if (!match) return null;
  
  const values = match[1].split(',').map(v => {
    const trimmed = v.trim();
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }
    if (trimmed === 'NULL') return null;
    return trimmed;
  });
  
  return values;
}

// Parse government colleges from govt.sql
function parseGovtColleges() {
  const govtPath = path.join(__dirname, '../../govt.sql');
  if (!fs.existsSync(govtPath)) {
    console.warn('⚠ govt.sql not found at:', govtPath);
    return [];
  }
  
  const content = fs.readFileSync(govtPath, 'utf-8');
  const colleges = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('INSERT INTO colleges')) {
      const values = parseInsertValues(line);
      if (values && values.length >= 4) {
        colleges.push({
          code: values[1],
          name: values[2],
          type: 'Government',
          address: values[3]
        });
      }
    }
  }
  
  console.log(`✓ Parsed ${colleges.length} government colleges from govt.sql`);
  return colleges;
}

// Parse affiliated colleges from sheet1.sql
function parseAffiliatedColleges() {
  const sheet1Path = path.join(__dirname, '../../sheet1.sql');
  if (!fs.existsSync(sheet1Path)) {
    console.warn('⚠ sheet1.sql not found at:', sheet1Path);
    return [];
  }
  
  const content = fs.readFileSync(sheet1Path, 'utf-8');
  const colleges = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('INSERT INTO colleges') || line.includes('colleges_data')) {
      const values = parseInsertValues(line);
      if (values && values.length >= 3) {
        // Check if it's a new college entry
        if (values[0] && values[1]) {
          colleges.push({
            code: values[0],
            name: values[1],
            type: 'Affiliated',
            district: values[2] || 'Unknown'
          });
        }
      }
    }
  }
  
  console.log(`✓ Parsed ${colleges.length} affiliated colleges from sheet1.sql`);
  return colleges;
}

// Parse courses/branches
function parseCourses() {
  const sheet1Path = path.join(__dirname, '../../sheet1.sql');
  if (!fs.existsSync(sheet1Path)) return [];
  
  const content = fs.readFileSync(sheet1Path, 'utf-8');
  const courses = new Set();
  
  // Match branch/course codes (format: XXXX-COURSE NAME)
  const coursePattern = /(\d{4})['\"]?\s*[-,:]?\s*['"]?([A-Z\s&().,\/\-]+)['\"]?/g;
  let match;
  
  while ((match = coursePattern.exec(content)) !== null) {
    const code = match[1];
    const name = match[2]?.trim();
    if (code && name && name.length > 5) {
      courses.add(`${code}-${name}`);
    }
  }
  
  const courseArray = Array.from(courses).sort();
  console.log(`✓ Parsed ${courseArray.length} unique courses from sheet1.sql`);
  return courseArray;
}

// Main analysis
function analyzeAllData() {
  console.log('\n═══════════════════════════════════════════════\n');
  console.log('🔍 DOTE SQL FILE ANALYSIS\n');
  
  // Get all SQL files
  const sqlFiles = fs.readdirSync(path.join(__dirname, '../../'), { parentPath: true })
    .filter(f => f.endsWith('.sql'))
    .map(f => {
      const fullPath = path.join(__dirname, '../../', f);
      const stats = fs.statSync(fullPath);
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').length;
      return { file: f, size: stats.size, lines };
    })
    .sort((a, b) => b.size - a.size);
  
  console.log('📁 SQL Files Found:');
  let totalLines = 0;
  for (const file of sqlFiles) {
    console.log(`  • ${file.file}: ${file.lines.toLocaleString()} lines (${(file.size / 1024).toFixed(1)} KB)`);
    totalLines += file.lines;
  }
  
  console.log(`\n  Total: ${totalLines.toLocaleString()} lines across ${sqlFiles.length} files\n`);
  
  // Parse colleges
  console.log('📚 Parsing College Data:');
  const govtColleges = parseGovtColleges();
  const affColleges = parseAffiliatedColleges();
  
  // Parse courses
  console.log('\n🎓 Parsing Course Data:');
  const courses = parseCourses();
  
  // Summary
  console.log('\n\n═══════════════════════════════════════════════');
  console.log('✨ DATA EXTRACTION SUMMARY');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log(`📊 Colleges Extracted: ${govtColleges.length + affColleges.length}`);
  console.log(`   • Government: ${govtColleges.length}`);
  console.log(`   • Affiliated: ${affColleges.length}`);
  console.log(`\n📚 Unique Courses: ${courses.length}`);
  
  if (govtColleges.length > 0) {
    console.log(`\n🏛️  Government Colleges (${govtColleges.length}):`);
    govtColleges.slice(0, 5).forEach(c => {
      console.log(`   • [${c.code}] ${c.name}`);
    });
    if (govtColleges.length > 5) {
      console.log(`   ... and ${govtColleges.length - 5} more`);
    }
  }
  
  if (affColleges.length > 0) {
    console.log(`\n🏢 Affiliated Colleges (${affColleges.length}):`);
    affColleges.slice(0, 5).forEach(c => {
      console.log(`   • [${c.code}] ${c.name}`);
    });
    if (affColleges.length > 5) {
      console.log(`   ... and ${affColleges.length - 5} more`);
    }
  }
  
  console.log(`\n📖 Sample Courses:`);
  courses.slice(0, 8).forEach(c => console.log(`   • ${c}`));
  console.log(`\n═══════════════════════════════════════════════\n`);
  
  return {
    govtColleges,
    affColleges,
    courses,
    sqlFiles
  };
}

module.exports = { analyzeAllData, parseGovtColleges, parseAffiliatedColleges, parseCourses };

// Run if invoked directly
if (require.main === module) {
  analyzeAllData();
}
