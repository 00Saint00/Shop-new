import { createSlice } from "@reduxjs/toolkit";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  role?: string | null;
  phone: string | null;
  address: string | null;
  store_name: string | null;
  contact_number: string | null;
  store_description: string | null;
  business_address: string | null;
  status: string | null;
  approved?: boolean | null;
} | null;

const initialState = {
  user: null as unknown,
  isAuthenticated: false,
  profile: null as Profile,
  authReady: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.profile) {
        state.profile = action.payload.profile;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.profile = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setAuthReady: (state, action) => {
      state.authReady = action.payload;
    },
  },
});

export const { login, logout, setUser, setProfile, setAuthReady } =
  authSlice.actions;
export default authSlice.reducer;
