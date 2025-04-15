import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentView: string;
  notifications: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }[];
  isLoading: boolean;
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any | null;
  };
  helpTooltipsEnabled: boolean;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmAction: string | null;
    cancelAction: string | null;
    data: any | null;
  };
}

// Initial state
const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  currentView: 'dashboard',
  notifications: [],
  isLoading: false,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  helpTooltipsEnabled: true,
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    confirmAction: null,
    cancelAction: null,
    data: null,
  },
};

// Create slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentView = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      state.notifications.push({
        id: `notification-${Date.now()}`,
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    toggleHelpTooltips: (state) => {
      state.helpTooltipsEnabled = !state.helpTooltipsEnabled;
    },
    setHelpTooltipsEnabled: (state, action: PayloadAction<boolean>) => {
      state.helpTooltipsEnabled = action.payload;
    },
    openConfirmDialog: (state, action: PayloadAction<Omit<UIState['confirmDialog'], 'isOpen'>>) => {
      state.confirmDialog = {
        isOpen: true,
        ...action.payload,
      };
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog = {
        isOpen: false,
        title: '',
        message: '',
        confirmAction: null,
        cancelAction: null,
        data: null,
      };
    },
  },
});

// Export actions and reducer
export const { 
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setCurrentView,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  openModal,
  closeModal,
  toggleHelpTooltips,
  setHelpTooltipsEnabled,
  openConfirmDialog,
  closeConfirmDialog
} = uiSlice.actions;
export default uiSlice.reducer;
