# Implementation Guide - Educational History Upgrade

## Quick Start

### Step 1: Add New Component to Application Form

Edit `client/src/pages/student/ApplicationForm.jsx`:

```javascript
// Add import
import EducationalHistory from '../../components/forms/EducationalHistory';

// In the form, replace or add alongside existing MarksEntry:
<div className="tab-content">
  {/* Other existing form sections */}
  
  {/* NEW: Educational History */}
  <EducationalHistory />
  
  {/* OPTIONAL: Keep old MarksEntry for backwards compatibility */}
  {/* <MarksEntry /> */}
</div>
```

### Step 2: Update Redux Store

The component expects the Redux store to have an `education` field in `formData`. Make sure your `applicationSlice.js` handling this:

```javascript
// In your initialState:
const initialState = {
  formData: {
    // ... existing fields
    education: {
      sections: [],        // Selected education types
      sslc: {},           // SSLC data
      hsc: {},            // HSC data
      iti: {},            // ITI data
      vocational: {}      // Vocational data
    }
  }
};
```

### Step 3: Update Application Form Step Navigation

Update your form wizard to include Educational History as a distinct step:

```javascript
// In ApplicationForm.jsx setup
const steps = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'contact', label: 'Contact Details', icon: Phone },
  { id: 'parent', label: 'Parent Details', icon: Users },
  { id: 'academic', label: 'Academic Details', icon: BookOpen },
  { id: 'marks', label: 'Marks', icon: FileText },
  { id: 'education', label: 'Educational History', icon: GraduationCap }, // NEW
  { id: 'colleges', label: 'College Preferences', icon: Building },
  { id: 'special', label: 'Special Category', icon: Award },
  { id: 'preview', label: 'Preview & Submit', icon: CheckCircle },
];
```

## Features Explained

### 1. Multi-Select Education Sections
Students can select one or more education backgrounds:
- **SSLC (10th)** - 5 subjects, 500 marks
- **HSC (12th)** - 6 subjects, 600 marks (can vary by major)
- **ITI** - 5 subjects, 700 marks
- **Vocational** - 6 subjects, 1200 marks

### 2. HSC Major/Stream Selection
When HSC is selected, students choose their stream:
- **Biology**: Physics, Chemistry, Biology, Mathematics
- **Mathematics**: Physics, Chemistry, Mathematics, Computer Science
- **Commerce**: Accountancy, Economics, Business Studies
- **Humanities**: History, Geography, Economics, Political Science
- **General**: Basic science stream

### 3. Cutoff Score Calculation
For Biology and Mathematics streams, automatic calculation:

**Biology**: `(Biology ÷ 2) + (Physics ÷ 4) + (Chemistry ÷ 4)`
**Mathematics**: `(Mathematics ÷ 2) + (Physics ÷ 4) + (Chemistry ÷ 4)`

The cutoff score appears in real-time as students enter marks.

### 4. Marks Tables
Each education section has an editable marks table:
- Auto-calculates totals
- Shows percentage
- Validates input ranges
- Shows section-specific headers

## Data Submission

When submitting the form, the education data structure would be:

```json
{
  "application_id": 123,
  "education": {
    "sections": ["sslc", "hsc"],
    
    "sslc": {
      "school_name": "St. Mary's School",
      "board": "Tamil Nadu State Board",
      "year": 2022,
      "register_no": "REG123456",
      "marksheet_no": "MS123456",
      "subjects": [
        { "subject": "Tamil", "max": 100, "marks": "95" },
        { "subject": "English", "max": 100, "marks": "88" },
        // ... more subjects
      ]
    },
    
    "hsc": {
      "school_name": "Vidyaa Higher Secondary School",
      "board": "Tamil Nadu State Board",
      "major": "biology",
      "exam_type": 600,
      "year": 2024,
      "register_no": "REG789012",
      "subjects": [
        { "subject": "Tamil", "max": 100, "marks": "92" },
        // ... more subjects
      ]
    }
  }
}
```

## Validation Rules

Before submission, validate:

```javascript
// Check if sections are selected
if (!educationData.sections || educationData.sections.length === 0) {
  throw new Error('Select at least one education section');
}

// For each selected section, validate required fields
if (educationData.sections.includes('sslc')) {
  if (!educationData.sslc.school_name) throw new Error('SSLC: School name required');
  if (!educationData.sslc.board) throw new Error('SSLC: Board required');
}

if (educationData.sections.includes('hsc')) {
  if (!educationData.hsc.school_name) throw new Error('HSC: School name required');
  if (!educationData.hsc.major) throw new Error('HSC: Major/Stream required');
}

// Validate that at least one subject has marks
const hasMarks = (subjects) => subjects.some(s => s.marks);
if (!hasMarks(educationData.sslc.subjects)) throw new Error('SSLC: No marks entered');
```

## Backend API Preparation

When sending to backend, prepare this endpoint:

```
POST /api/v1/applications/:applicationId/education
Content-Type: application/json

{
  "education": { ... }  // Full education object
}
```

Backend should:
1. Validate all required fields
2. Store as JSON in database (recommended for flexibility)
3. Calculate cutoff scores server-side for verification
4. Return confirmation with stored data

## Database Schema (Recommended)

```sql
CREATE TABLE application_education (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  education_sections JSON,      -- ["sslc", "hsc", "iti", "vocational"]
  
  -- SSLC Data
  sslc_data JSON,               -- { school_name, board, year, ... }
  sslc_subjects JSON,           -- Array of { subject, max, marks }
  
  -- HSC Data
  hsc_data JSON,                -- { school_name, major, exam_type, ... }
  hsc_subjects JSON,            -- Array of { subject, max, marks }
  hsc_cutoff_score DECIMAL(5,2),
  
  -- ITI Data
  iti_data JSON,
  iti_subjects JSON,
  
  -- Vocational Data
  vocational_data JSON,
  vocational_subjects JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES applications(application_id)
);
```

## Testing Checklist

- [ ] Component loads without errors
- [ ] Can select/deselect education sections
- [ ] SSLC section displays correctly
- [ ] HSC major selection changes subjects
- [ ] Cutoff score calculates in real-time
- [ ] ITI section shows correct subjects
- [ ] Vocational section displays 1200 marks total
- [ ] Marks input shows proper validation
- [ ] Totals and percentages calculate correctly
- [ ] Can submit form with education data
- [ ] Data persists after navigation between steps

## Troubleshooting

### Issue: Component not rendering
**Solution:** Check that Redux has `education` field in initialState

### Issue: HSC subjects not changing
**Solution:** Verify `HSC_SUBJECTS_BY_MAJOR` object has all majors

### Issue: Cutoff score showing NaN
**Solution:** Ensure Physics, Chemistry, Biology fields have numeric values

### Issue: Marks not updating
**Solution:** Check the `onChange` handler is properly connected to Redux dispatch

## Future Enhancements

1. **Examination Attempts** - Track retakes/improvements
2. **Subject Validation** - Verify subject combinations per board
3. **Grade Conversion** - Convert grades to marks if needed
4. **File Upload** - Attach marksheet images for verification
5. **Board-Specific Subjects** - Different subjects per board
6. **Language Selection** - Choose languages for each exam
7. **PDF Export** - Generate education history summary

