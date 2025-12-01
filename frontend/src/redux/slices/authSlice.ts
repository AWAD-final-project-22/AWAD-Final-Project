import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name?: string;
  provider?: string;
}

interface AuthenticationState {
  accessToken: string | null;
  user: User | null;
}

const initialState: AuthenticationState = {
  accessToken: null,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      if (!action.payload) {
        state.user = null;
      }
    },

    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: User }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },

    logout: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const selectAccessToken = (state: { auth: AuthenticationState }) =>
  state.auth.accessToken;
export const selectCurrentUser = (state: { auth: AuthenticationState }) =>
  state.auth.user;

export const { setAccessToken, setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
