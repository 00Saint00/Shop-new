import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";

// Central Redux store for app-wide state.
export const store = configureStore({
  reducer: {
    // Auth/session state (logged in user + profile data).
    auth: authReducer,
  },
});

// RootState = inferred shape of the entire Redux state tree.
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch = typed dispatch for thunk/actions in this app.
export type AppDispatch = typeof store.dispatch;
