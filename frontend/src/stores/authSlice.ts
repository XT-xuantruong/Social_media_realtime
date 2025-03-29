import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: {
    accessToken: string | null;
    refreshToken: string | null;
  } | null;
  user: {
    userId: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  } | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.token = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    },
    setUser: (state, action: PayloadAction<{ user: object }>) => {
      state.user = action.payload.user as AuthState["user"];
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
