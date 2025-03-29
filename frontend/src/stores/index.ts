import { configureStore } from "@reduxjs/toolkit";
import { baseRestApi } from "@/services/baseRestApi";
import { baseGraphqlApi } from "@/services/baseGraphqlApi";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    [baseRestApi.reducerPath]: baseRestApi.reducer,
    [baseGraphqlApi.reducerPath]: baseGraphqlApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseRestApi.middleware,
      baseGraphqlApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
