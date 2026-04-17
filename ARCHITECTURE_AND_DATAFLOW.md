# 🏗️ Educational History System - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOTE Admission System                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            ApplicationForm.jsx (Main Form)              │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Form Steps Navigation                           │  │  │
│  │  │ [Personal] > [Contact] > [Parent] > [Academic] │  │  │
│  │  │ > [Marks] > [Education] > [Colleges] > [Review]│  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  CONTENT AREA (Changes based on current step)   │  │  │
│  │  │                                                  │  │  │
│  │  │  Current: [EducationalHistory Component]        │  │  │
│  │  │                                                  │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │  EducationalHistory.jsx (YOUR NEW FILE) │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  │  ✓ Multi-section selector               │  │  │  │
│  │  │  │  ✓ Conditional section rendering        │  │  │  │
│  │  │  │  ✓ Redux integration                    │  │  │  │
│  │  │  │  ✓ Real-time calculations              │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐  │  │  │  │
│  │  │  │  │ MarksTable.jsx (Sub-component)  │  │  │  │  │
│  │  │  │  │                                 │  │  │  │  │
│  │  │  │  │ ✓ Subjects input                │  │  │  │  │
│  │  │  │  │ ✓ Marks validation              │  │  │  │  │
│  │  │  │  │ ✓ Total & Percentage calc       │  │  │  │  │
│  │  │  │  └─────────────────────────────────┘  │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  │ ┌─ SSLC Section                         │  │  │  │
│  │  │  │ │  School | Board | Year                │  │  │  │
│  │  │  │ │  Register | Marksheet                 │  │  │  │
│  │  │  │ │  [Marks Table component]              │  │  │  │
│  │  │  │ │                                        │  │  │  │
│  │  │  │ ├─ HSC Section                          │  │  │  │
│  │  │  │ │  School | Board | Year                │  │  │  │
│  │  │  │ │  Major [Biology/Math/Commerce...]     │  │  │  │
│  │  │  │ │  Exam Type [600/1200]                 │  │  │  │
│  │  │  │ │  [Marks Table component - dynamic]    │  │  │  │
│  │  │  │ │  📊 Cutoff Score Panel (calculated)   │  │  │  │
│  │  │  │ │                                        │  │  │  │
│  │  │  │ ├─ ITI Section                          │  │  │  │
│  │  │  │ │  ITI Name | Trade | Year              │  │  │  │
│  │  │  │ │  [Marks Table - fixed 5 subjects]     │  │  │  │
│  │  │  │ │                                        │  │  │  │
│  │  │  │ └─ Vocational Section                   │  │  │  │
│  │  │  │    Institution | Stream | Year          │  │  │  │
│  │  │  │    [Marks Table - fixed 6 subjects]     │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  │                                                  │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │ Next/Previous Buttons                   │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Redux Store      │
                    │  (State mgmt)     │
                    │                   │
                    │ applicationSlice: │
                    │  education: {     │
                    │    sections: [],  │
                    │    sslc: {},      │
                    │    hsc: {},       │
                    │    iti: {},       │
                    │    vocational: {} │
                    │  }                │
                    └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Backend API      │
                    │                   │
                    │ POST /api/v1/     │
                    │ applications/     │
                    │ :id/education     │
                    └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  MySQL Database   │
                    │                   │
                    │ applications      │
                    │ education (JSON)  │
                    └───────────────────┘
```

---

## Data Flow

### 1. **User Selects Education Sections**
```
User clicks checkbox "SSLC" & "HSC"
         ↓
State updates: sections = ['sslc', 'hsc']
         ↓
Component re-renders
         ↓
SSLC Section appears + HSC Section appears
```

### 2. **SSLC Data Entry**
```
User enters SSLC data:
- School name: "St. Mary's"
- Board: "Tamil Nadu State Board"
- Year: 2022
- Register: REG123456
- Marks: [Tamil: 95, English: 88, ...]
         ↓
Redux store updates: formData.education.sslc = { ... }
         ↓
Component displays Total: 445/500, Percentage: 89%
         ↓
Data persists across navigation
```

### 3. **HSC Major Selection**
```
User selects Major: "Biology"
         ↓
Subject list changes:
FROM: [Tamil, English, Physics, Chemistry, Math, CS]
TO:   [Tamil, English, Physics, Chemistry, Biology, Math]
         ↓
User enters marks for all 6 subjects
         ↓
Cutoff calculation: (Bio/2 + Phy/4 + Chem/4)
Example: (95/2 + 90/4 + 88/4) = 47.5 + 22.5 + 22 = 92
         ↓
Cutoff score displays: "92"
```

### 4. **Form Submission**
```
User clicks "Continue" or "Submit"
         ↓
Form gathers education data from Redux:
{
  education: {
    sections: ['sslc', 'hsc'],
    sslc: { school_name: '...', marks: [...] },
    hsc: { school_name: '...', major: 'biology', ... }
  }
}
         ↓
Data sent to backend API
         ↓
Backend validates and stores in database
         ↓
Confirmation: "Application saved successfully"
```

---

## Redux State Structure

```javascript
applicationSlice = {
  formData: {
    // ... other form fields ...
    
    education: {
      // Array of selected education sections
      sections: ['sslc', 'hsc'],
      
      // SSLC Object
      sslc: {
        school_name: 'St. Mary\'s School',
        board: 'Tamil Nadu State Board',
        year: 2022,
        register_no: 'REG2022001',
        marksheet_no: 'MS2022001',
        subjects: [
          {
            subject: 'Tamil',
            max: 100,
            marks: '95'
          },
          {
            subject: 'English',
            max: 100,
            marks: '88'
          },
          // ... 3 more subjects ...
        ]
      },
      
      // HSC Object
      hsc: {
        school_name: 'Vidyaa HSS',
        board: 'Tamil Nadu State Board',
        major: 'biology',  // Changes available subjects
        exam_type: 600,    // Can be 600 or 1200
        year: 2024,
        register_no: 'REG2024001',
        subjects: [
          {
            subject: 'Tamil',
            max: 100,
            marks: '92'
          },
          // ... 5 more subjects per major ...
        ],
        // Calculated server-side for verification
        cutoff_score: 47.5
      },
      
      // ITI Object
      iti: {
        iti_name: 'Govt. ITI',
        trade: 'Electrician',
        year: 2023,
        register_no: 'ITI2023001',
        subjects: [
          { subject: 'Trade Practical', max: 400, marks: '380' },
          { subject: 'Theory', max: 120, marks: '95' },
          // ... 3 more trade subjects ...
        ]
      },
      
      // Vocational Object
      vocational: {
        institution: 'Govt. Polytechnic',
        stream: 'Electronics',
        year: 2024,
        register_no: 'VOCA2024001',
        subjects: [
          { subject: 'Language', max: 200, marks: '180' },
          { subject: 'English', max: 200, marks: '175' },
          // ... 4 more subjects (1200 total) ...
        ]
      }
    }
  }
}
```

---

## Component Hierarchy

```
EducationalHistory (Main Component)
│
├── [Multi-select Checkboxes]
│   ├─ ☐ SSLC
│   ├─ ☐ HSC
│   ├─ ☐ ITI
│   └─ ☐ Vocational
│
└─ [Conditional Sections]
   │
   ├─ SSLCSection (if selected)
   │  ├─ Input fields
   │  ├─ Board selector
   │  └─ MarksTable
   │
   ├─ HSCSection (if selected)
   │  ├─ Input fields
   │  ├─ Major selector (→ changes subjects)
   │  ├─ Exam type selector
   │  ├─ MarksTable (dynamic)
   │  └─ CutoffScorePanel (real-time calc)
   │
   ├─ ITISection (if selected)
   │  ├─ Input fields
   │  └─ MarksTable (fixed 5 subjects)
   │
   └─ VocationalSection (if selected)
      ├─ Input fields
      └─ MarksTable (fixed 6 subjects)

MarksTable (Reusable Sub-Component)
├─ Renders 5-6 subject rows
├─ Accepts marks input (0 - max)
├─ Calculates total
└─ Shows percentage
```

---

## Real-Time Update Flow

### Example: User changes HSC Major from Biology to Mathematics

```
User selects Major: "Mathematics"
         ↓
Section updates state:
const [hsctData, setHscData] = useState(...)
setHscData({ ...hscData, major: 'mathematics' })
         ↓
component detects major change
         ↓
subjects = HSC_SUBJECTS_BY_MAJOR['mathematics']
// Now: [Tamil, English, Physics, Chemistry, Mathematics, Computer Science]
         ↓
Previous marks cleared (safety)
         ↓
New MarksTable renders with new subjects
         ↓
User enters new marks
         ↓
Cutoff formula updates to Math formula:
(Math/2 + Physics/4 + Chemistry/4)
         ↓
Real-time calculation shows updated cutoff
```

---

## Integration Points

### 1. **ApplicationForm.jsx Integration**
```javascript
// At render time:
{currentStep === 'education' && <EducationalHistory />}

// On form submit:
const educationData = formData.education;
// Send to backend
```

### 2. **Redux Integration**
```javascript
// Component listens to:
const education = useSelector(state => state.application.formData.education);

// Component updates state via:
dispatch(updateFormData({ education: newEducationData }));
```

### 3. **Backend API Integration**
```javascript
// Endpoint receives:
POST /api/v1/applications/123/education
{
  "education": { ... complete education object ... }
}

// Backend validates and stores:
UPDATE applications 
SET education = JSON.stringify(educationData)
WHERE id = 123;
```

---

## Validation Flow

```
User enters marks: "95" for Tamil (max 100)
         ↓
Input validation: 0 ≤ 95 ≤ 100 ✓
         ↓
Mark accepted, state updates
         ↓
Total recalculates
         ↓
Percentage updates
         ↓
(For HSC) Cutoff score recalculates
         ↓
Display updates in real-time


User enters marks: "105" for Tamil (max 100)
         ↓
Input validation: 0 ≤ 105 ≤ 100 ✗
         ↓
Input rejected (max enforced)
         ↓
Warning shown: "Maximum marks is 100"
         ↓
Previous valid value retained
```

---

## Responsive Design Flow

```
Desktop (1024px+)
├─ Section selector in row
├─ Sections side-by-side
└─ Tables full width

Tablet (768px-1023px)
├─ Section selector in column
├─ Sections stacked
└─ Tables scrollable

Mobile (< 768px)
├─ Section selector single column
├─ Sections stacked vertically
└─ Tables scrollable horizontally
```

---

## Performance Considerations

### 1. **Component Rendering**
- Only selected sections render
- Conditional rendering prevents DOM bloat
- No unnecessary re-renders

### 2. **Calculation Optimization**
- Cutoff calculated once per mark change
- Results memoized to prevent recalculation
- No expensive operations in render

### 3. **Redux Optimization**
- Single education object in state
- Updates batched with updateFormData
- No duplicate subscriptions

### 4. **Bundle Size**
- EducationalHistory: ~15 KB (unminified)
- No external dependencies needed
- Fits in main bundle without issues

---

## Error Handling Scenarios

```
Scenario 1: User deselects HSC section
├─ HSC component unmounts
├─ HSC data remains in Redux (not deleted)
├─ Later re-selecting shows previous data
└─ User can recover accidentally deselected section

Scenario 2: Marks exceed maximum
├─ Input validation prevents entry
├─ Warning message shown
├─ Previous valid value retained
└─ Can only proceed with valid marks

Scenario 3: Required field empty on submit
├─ Server-side validation checks
├─ Clear error message returned
├─ User can correct and resubmit
└─ Data preserved during retry

Scenario 4: Network error on submit
├─ Error handled gracefully
├─ Data remains in Redux
├─ User can retry submission
└─ No data loss occurs
```

---

## Testing Matrix

```
Component       Test Case                    Expected Outcome
──────────────────────────────────────────────────────────────
Checkbox        Click SSLC checkbox         SSLC section appears
Checkbox        Click HSC checkbox          HSC section appears
Checkbox        Uncheck SSLC checkbox       SSLC section disappears
Selector        Change board (SSLC)         Subjects remain (board just changes)
Selector        Change HSC major            Subjects change dynamically
Input           Enter 0 marks               Accepted, total updates
Input           Enter 105 (max 100)         Rejected, warning shown
Input           Enter non-number            Rejected or converted
Calculation     All marks filled            Correct total shown
Calculation     All marks filled            Correct percentage shown
Calculation     HSC with Biology marks      Correct cutoff calculated
Calculation     HSC with Math marks         Correct cutoff calculated
ReduxIntegration Change data                Redux state updates
ReduxIntegration Navigate away              Data persists in Redux
ReduxIntegration Return to form             Data restored in form
```

---

## Key Constants Reference

```javascript
EDUCATION_SECTIONS = ['sslc', 'hsc', 'iti', 'vocational']

SSLC_SUBJECTS_INITIAL = 5 subjects × 100 marks = 500 total
ITI_SUBJECTS_INITIAL = 5 subjects, varying marks = 700 total
VOCATIONAL_SUBJECTS_INITIAL = 6 subjects × 200 marks = 1200 total

HSC_MAJORS = ['biology', 'mathematics', 'commerce', 'humanities', 'general']

HSC_SUBJECTS_BY_MAJOR = {
  'biology': 6 subjects @ 100 marks = 600 total,
  'mathematics': 6 subjects @ 100 marks = 600 total,
  'commerce': 6 subjects @ 100 marks = 600 total,
  'humanities': 6 subjects @ 100 marks = 600 total,
  'general': 6 subjects @ 100 marks = 600 total
}

CUTOFF_FORMULAS = {
  'biology': (Bio/2 + Phy/4 + Chem/4),
  'mathematics': (Math/2 + Phy/4 + Chem/4),
  'others': null
}
```

---

This architectural diagram and data flow reference will help you understand exactly how all pieces fit together!

