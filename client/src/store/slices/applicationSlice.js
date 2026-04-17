import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createApplication = createAsyncThunk('application/create', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/applications');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create application');
  }
});

export const updateApplication = createAsyncThunk('application/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/applications/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update application');
  }
});

export const fetchApplication = createAsyncThunk('application/fetch', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/applications/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch application');
  }
});

export const fetchMyApplications = createAsyncThunk('application/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/applications');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch applications');
  }
});

export const submitApplication = createAsyncThunk('application/submit', async (id, { rejectWithValue }) => {
  try {
    const res = await api.post(`/applications/${id}/submit`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Submission failed');
  }
});

const applicationSlice = createSlice({
  name: 'application',
  initialState: {
    current: null,
    list: [],
    currentStep: 1,
    loading: false,
    error: null,
    formData: {
      // Personal
      name: '', dob: '', gender: '', aadhaar: '', religion: '', community_id: '', caste_id: '',
      // Contact
      comm_address: '', comm_city: '', comm_district_id: '', comm_pincode: '',
      perm_address: '', perm_city: '', perm_district_id: '', perm_pincode: '', alt_mobile: '', email: '',
      // Parent
      father_name: '', mother_name: '', parent_occupation: '', annual_income: '',
      // Academic
      board: '', register_no: '', last_school: '', admission_type: 'FIRST_YEAR',
      // Marks
      marks: [],
      // Special
      is_differently_abled: 0, is_ex_servicemen: 0, is_sports_person: 0, is_govt_school: 0,
      // Hostel & colleges
      hostel_required: 0,
      college_preferences: [],
    },
  },
  reducers: {
    setCurrentStep: (state, action) => { state.currentStep = action.payload; },
    updateFormData: (state, action) => { state.formData = { ...state.formData, ...action.payload }; },
    resetFormData: (state) => { state.formData = applicationSlice.getInitialState().formData; state.currentStep = 1; },
    clearApplicationError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createApplication.pending, (state) => { state.loading = true; })
      .addCase(createApplication.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(createApplication.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchApplication.fulfilled, (state, action) => {
        state.current = action.payload;
        if (action.payload?.student) {
          const s = action.payload.student;
          state.formData = {
            ...state.formData,
            name: s.name || '', dob: s.dob || '', gender: s.gender || '',
            aadhaar: s.aadhaar || '', religion: s.religion || '',
            community_id: s.community_id || '', caste_id: s.caste_id || '',
            comm_address: s.comm_address || '', comm_city: s.comm_city || '',
            comm_district_id: s.comm_district_id || '', comm_pincode: s.comm_pincode || '',
            perm_address: s.perm_address || '', perm_city: s.perm_city || '',
            perm_district_id: s.perm_district_id || '', perm_pincode: s.perm_pincode || '',
            alt_mobile: s.alt_mobile || '', email: s.email || '',
            father_name: s.father_name || '', mother_name: s.mother_name || '',
            parent_occupation: s.parent_occupation || '', annual_income: s.annual_income || '',
            board: s.board || '', register_no: s.register_no || '', last_school: s.last_school || '',
            admission_type: s.admission_type || 'FIRST_YEAR',
            hostel_required: s.hostel_required || 0,
            is_differently_abled: s.is_differently_abled || 0,
            is_ex_servicemen: s.is_ex_servicemen || 0,
            is_sports_person: s.is_sports_person || 0,
            is_govt_school: s.is_govt_school || 0,
            marks: action.payload.marks || [],
            college_preferences: (action.payload.collegePreferences || []).map(p => ({
              college_id: p.college_id, course_id: p.course_id, preference_order: p.preference_order,
              college: p.college,
            })),
          };
        }
      })

      .addCase(fetchMyApplications.fulfilled, (state, action) => { state.list = action.payload; })

      .addCase(updateApplication.pending, (state) => { state.loading = true; })
      .addCase(updateApplication.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(updateApplication.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setCurrentStep, updateFormData, resetFormData, clearApplicationError } = applicationSlice.actions;
export default applicationSlice.reducer;
