import { configureStore } from '@reduxjs/toolkit';
import { baseRestApi } from '@/services/rest_api/baseRestApi';
import { baseGraphqlApi } from '@/services/graphql/baseGraphqlApi';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  [baseRestApi.reducerPath]: baseRestApi.reducer,
  [baseGraphqlApi.reducerPath]: baseGraphqlApi.reducer,
  auth: authReducer,
  chat: chatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
        ],
      },
    }).concat(baseRestApi.middleware, baseGraphqlApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
