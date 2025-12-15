import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/axios';

// Define User type based on backend model
interface UserAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    role: 'user' | 'admin';
    address?: UserAddress;
    paymentDetails?: {
        cardLast4: string;
        brand: string;
    };
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isLoading: true, // Start loading to check auth on mount
    error: null,
    isAuthenticated: false,
};

// Async Thunks
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/users/profile');
        return data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Not authenticated');
    }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/users/auth', credentials);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

export const registerUser = createAsyncThunk('auth/register', async (userData: any, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/users', userData);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await api.post('/users/logout');
    } catch (error: any) {
        console.error('Logout error', error);
    }
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (userData: any, { rejectWithValue }) => {
    try {
        const { data } = await api.put('/users/profile', userData);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Check Auth
        builder
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        });

        // Update Profile
        builder
            .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
