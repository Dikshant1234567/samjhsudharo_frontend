import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isAddPostModalOpen: boolean;
  isNotificationDrawerOpen: boolean;
  isProfileDrawerOpen: boolean;
  addPostType: 'vlog' | 'event' | null;
}

const initialState: ModalState = {
  isAddPostModalOpen: false,
  isNotificationDrawerOpen: false,
  isProfileDrawerOpen: false,
  addPostType: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    toggleAddPostModal: (state) => {
      state.isAddPostModalOpen = !state.isAddPostModalOpen;
    },
    setAddPostModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddPostModalOpen = action.payload;
    },
    setAddPostType: (state, action: PayloadAction<'vlog' | 'event' | null>) => {
      state.addPostType = action.payload;
    },
    toggleNotificationDrawer: (state) => {
      state.isNotificationDrawerOpen = !state.isNotificationDrawerOpen;
    },
    setNotificationDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationDrawerOpen = action.payload;
    },
    toggleProfileDrawer: (state) => {
      state.isProfileDrawerOpen = !state.isProfileDrawerOpen;
    },
    setProfileDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isProfileDrawerOpen = action.payload;
    },
    closeAllModals: (state) => {
      state.isAddPostModalOpen = false;
      state.isNotificationDrawerOpen = false;
      state.isProfileDrawerOpen = false;
      state.addPostType = null;
    },
  },
});

export const {
  toggleAddPostModal,
  setAddPostModalOpen,
  setAddPostType,
  toggleNotificationDrawer,
  setNotificationDrawerOpen,
  toggleProfileDrawer,
  setProfileDrawerOpen,
  closeAllModals,
} = modalSlice.actions;

export default modalSlice.reducer;
