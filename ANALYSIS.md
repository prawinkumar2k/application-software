# DOTE Admission System - Educational Flow Analysis & Upgrade Plan

## Reference Project Structure Analysis

### 1. Current vs. Desired State

**Current Implementation (Your Project):**
- ✅ Simple board selection (7 boards)
- ✅ Dynamic subjects based on board
- ❌ Only supports one education type
- ❌ No HSC major/stream selection
- ❌ No cutoff score calculation
- ❌ No exam type variations (600/1200)

**Reference Project (Target):**
- ✅ 4 education sections (SSLC, ITI, Vocational, HSC)
- ✅ Multi-select education sections
- ✅ HSC with 5 majors (Biology, Math, Commerce, Humanities, General)
- ✅ HSC exam types (600 marks & 1200 marks)
- ✅ Dynamic subjects per major/exam type
- ✅ Cutoff score calculation formulas
- ✅ Examination attempts tracking
- ✅ Language selection per board

---

## 2. Subject Structure by Education Type

### SSLC (10th Standard)
```
- Tamil (100)
- English (100)
- Mathematics (100)
- Science (100)
- Social Science (100)
Total: 500 marks
```

### ITI (Industrial Training)
```
- Trade Practical (400)
- Trade Theory (120)
- Workshop (60)
- Drawing (70)
- Social (50)
Total: 700 marks
```

### Vocational
```
- Language (200)
- English (200)
- Maths (200)
- Theory (200)
- Practical-I (200)
- Practical-II (200)
Total: 1200 marks
```

### HSC (12th Standard) - With Majors
**Biology & General:**
- Tamil (100/200)
- English (100/200)
- Physics (100/200)
- Chemistry (100/200)
- Biology (100/200)
- Mathematics (100/200)

**Mathematics Stream:**
- Tamil (100/200)
- English (100/200)
- Physics (100/200)
- Chemistry (100/200)
- Mathematics (100/200)
- Computer Science (100/200)

**Commerce:**
- Tamil (100/200)
- English (100/200)
- Accountancy (100/200)
- Economics (100/200)
- Business Studies (100/200)
- Mathematics (100/200)

**Humanities:**
- Tamil (100/200)
- English (100/200)
- History (100/200)
- Geography (100/200)
- Economics (100/200)
- Political Science (100/200)

---

## 3. HSC Cutoff Calculation

**Biology Stream:** `(Biology ÷ 2) + (Physics ÷ 4) + (Chemistry ÷ 4)`
**Mathematics Stream:** `(Mathematics ÷ 2) + (Physics ÷ 4) + (Chemistry ÷ 4)`
**Commerce:** No cutoff (aggregate percentage)
**Humanities:** No cutoff (aggregate percentage)

---

## 4. Implementation Steps

### Step 1: Enhanced MarksEntry Component
- Support 4 education sections (checkboxes)
- Conditional rendering based on selection
- Section-specific UI modules

### Step 2: SSLC Module
- Fixed 5 subjects
- Details: School Name, Board, Languages (2), Year, Register No, Marksheet No
- Marks table with total & percentage

### Step 3: ITI Module
- Fixed 5 subjects (Trade-specific)
- Details: ITI Name, Trade, Year, Register No
- Marks with percentages

### Step 4: Vocational Module
- Fixed 6 subjects
- 1200 total marks
- Details: Institution, Stream, Year, Register No

### Step 5: HSC Module (Complex)
- Major/Stream selector (Biology, Math, Commerce, Humanities, General)
- Exam type selector (600 or 1200 marks)
- Dynamic subject allocation per major
- Cutoff score calculation
- Details: School Name, Board, Year, Register No

### Step 6: Examination Attempts
- Count selector per education section
- Dynamic attempt cards
- Fields: Marksheet No, Exam Reg No, Month & Year, Total Marks

---

## 5. Data Structure for Database

```javascript
// Marks data structure
{
  marks_id: PRIMARY_KEY,
  application_id: FK,
  
  // Section selection
  education_sections: JSON (sslc, iti, vocational, hsc)
  
  // SSLC Data
  sslc_school: VARCHAR,
  sslc_board: VARCHAR,
  sslc_language_paper1: VARCHAR,
  sslc_language_paper2: VARCHAR,
  sslc_year: YEAR,
  sslc_register_no: VARCHAR,
  sslc_marksheet_no: VARCHAR,
  sslc_subjects: JSON (array),
  sslc_attempts: JSON (array),
  
  // ITI Data
  iti_name: VARCHAR,
  iti_trade: VARCHAR,
  iti_year: YEAR,
  iti_register_no: VARCHAR,
  iti_subjects: JSON,
  iti_attempts: JSON,
  
  // Vocational Data
  vocational_institute: VARCHAR,
  vocational_stream: VARCHAR,
  vocational_year: YEAR,
  vocational_register_no: VARCHAR,
  vocational_subjects: JSON,
  vocational_attempts: JSON,
  
  // HSC Data
  hsc_school: VARCHAR,
  hsc_board: VARCHAR,
  hsc_major: VARCHAR (biology|math|commerce|humanities|general),
  hsc_exam_type: INT (600|1200),
  hsc_year: YEAR,
  hsc_register_no: VARCHAR,
  hsc_subjects: JSON,
  hsc_cutoff_score: DECIMAL,
  hsc_cutoff_formula: VARCHAR,
  hsc_attempts: JSON
}
```

---

## 6. Component Architecture

```
MarksEntry (Main Component)
├── EducationSectionSelector (Checkbox Multi-select)
├── SSLCSection (if selected)
│   ├── SSLCDetails
│   └── SSLCMarksTable
├── ITISection (if selected)
│   ├── ITIDetails
│   └── ITIMarksTable
├── VocationalSection (if selected)
│   ├── VocationalDetails
│   └── VocationalMarksTable
└── HSCSection (if selected)
    ├── HSCDetails
    ├── HSCMajorSelector
    ├── HSCExamTypeSelector
    ├── HSCMarksTable
    ├── HSCCutoffCalculator
    └── HSCAttempts
```

---

## 7. Redux State Structure

```javascript
// applicationSlice needs to store:
{
  formData: {
    // ... existing fields
    marks: {
      sections: ['sslc', 'hsc'], // selected sections
      
      sslc: {
        school_name: '',
        board: '',
        languages: { paper1: '', paper2: '' },
        year: '',
        register_no: '',
        marksheet_no: '',
        subjects: [],
        attempts: []
      },
      
      iti: {...},
      vocational: {...},
      
      hsc: {
        school_name: '',
        board: '',
        major: 'biology',
        exam_type: 600,
        year: '',
        register_no: '',
        subjects: [],
        cutoff_score: null,
        cutoff_formula: null,
        attempts: []
      }
    }
  }
}
```

---

## 8. Features to Implement

| Feature | Priority | Complexity | Time |
|---------|----------|-----------|------|
| Multi-section selector | High | Low | 1h |
| SSLC module | High | Low | 2h |
| ITI module | High | Low | 2h |
| Vocational module | High | Low | 2h |
| HSC basic module | High | Medium | 3h |
| HSC major selector | High | Medium | 2h |
| HSC exam type selector | High | Medium | 2h |
| Cutoff calculation | Medium | Medium | 2h |
| Examination attempts | Medium | Medium | 3h |
| Form validation | High | Low | 1h |
| **Total** | | | **20h** |

---

## 9. Migration Path

1. **Phase 1:** Keep current MarksEntry as-is, make optional
2. **Phase 2:** Add new EducationalHistory component
3. **Phase 3:** Gradually replace current with new system
4. **Phase 4:** Remove legacy code

### Recommendation
Create new `EducationalHistory.jsx` component and integrate alongside existing MarksEntry during transition period.

