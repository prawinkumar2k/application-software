import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const registerStudent = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/verify-otp', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
  }
});

export const loginStudent = createAsyncThunk('auth/loginStudent', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const loginAdmin = createAsyncThunk('auth/loginAdmin', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/admin/login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (_) {}
});

export const restoreStudentProfile = createAsyncThunk('auth/restoreStudentProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/profile');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to restore profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    student: null,
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    loading: false,
    error: null,
    otpSent: false,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    clearAuth: (state) => {
      state.user = null;
      state.student = null;
      state.token = null;
      state.role = null;
      state.otpSent = false;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerStudent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerStudent.fulfilled, (state) => { state.loading = false; state.otpSent = true; })
      .addCase(registerStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(verifyOTP.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.data?.accessToken;
        state.student = action.payload.data?.student;
        state.role = 'student';
        if (action.payload.data?.accessToken) localStorage.setItem('token', action.payload.data.accessToken);
        localStorage.setItem('role', 'student');
      })
      .addCase(verifyOTP.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(loginStudent.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.data?.accessToken;
        state.student = action.payload.data?.student;
        state.role = 'student';
        if (action.payload.data?.accessToken) localStorage.setItem('token', action.payload.data.accessToken);
        localStorage.setItem('role', 'student');
      })
      .addCase(loginStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(loginAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.data?.accessToken;
        state.user = action.payload.data?.user;
        state.role = action.payload.data?.user?.role;
        if (action.payload.data?.accessToken) localStorage.setItem('token', action.payload.data.accessToken);
        localStorage.setItem('role', action.payload.data?.user?.role);
      })
      .addCase(loginAdmin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.student = null; state.token = null; state.role = null;
        localStorage.removeItem('token'); localStorage.removeItem('role');
      })

      .addCase(restoreStudentProfile.fulfilled, (state, action) => {
        state.student = action.payload;
      })
      .addCase(restoreStudentProfile.rejected, (state) => {
        state.token = null; state.role = null;
        localStorage.removeItem('token'); localStorage.removeItem('role');
      });
  },
});

export const { setToken, clearAuth, clearError } = authSlice.actions;
export { authSlice };
export default authSlice.reducer;
