import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';
import notificationReducer from './services/notificationService';

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
