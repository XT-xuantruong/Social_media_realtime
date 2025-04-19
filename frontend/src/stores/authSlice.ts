import { PaginatedResponse } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: {
    accessToken: string | null;
    refreshToken: string | null;
  } | null;
  user: UserInfo | null;
  friends: PaginatedResponse<UserInfo> | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  friends: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setFriendOfUser: (
      state,
      action: PayloadAction<{ friends: PaginatedResponse<UserInfo> }>
    ) => {
      state.friends = action.payload.friends;
    },
    setAuth: (
      state,
      action: PayloadAction<{
        user: object;
        token: { accessToken: string; refreshToken: string };
      }>
    ) => {
      state.user = action.payload.user as AuthState['user'];
      state.token = {
        accessToken: action.payload.token.accessToken,
        refreshToken: action.payload.token.refreshToken,
      };
    },
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.token = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    },
    setUser: (
      state,
      action: PayloadAction<{
        user: object;
      }>
    ) => {
      state.user = action.payload.user as AuthState['user'];
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.friends = null;
    },
  },
});

export const { setAuth, setCredentials, setUser, setFriendOfUser, logout } =
  authSlice.actions;
export default authSlice.reducer;
