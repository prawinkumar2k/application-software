import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAvailableColleges = createAsyncThunk('colleges/fetchAvailable', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/colleges/available', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch colleges');
  }
});

export const fetchAllCollegesAdmin = createAsyncThunk('colleges/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/colleges', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const collegeSlice = createSlice({
  name: 'colleges',
  initialState: {
    available: [],
    allColleges: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableColleges.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAvailableColleges.fulfilled, (state, action) => {
        state.loading = false;
        state.available = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
      })
      .addCase(fetchAvailableColleges.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchAllCollegesAdmin.fulfilled, (state, action) => {
        state.allColleges = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
      });
  },
});

export default collegeSlice.reducer;
