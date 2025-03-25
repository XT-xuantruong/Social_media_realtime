import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Cấu hình store với các reducer
export const store = configureStore({
  reducer: {
    auth: authReducer, // Reducer cho authentication
  },
});

// Định nghĩa type cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
