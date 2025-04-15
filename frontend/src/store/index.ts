import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import reducers
import departmentsReducer from './slices/departmentsSlice';
import rolesReducer from './slices/rolesSlice';
import matricesReducer from './slices/matricesSlice';
import calculatorsReducer from './slices/calculatorsSlice';
import chartsReducer from './slices/chartsSlice';
import implementationsReducer from './slices/implementationsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    departments: departmentsReducer,
    roles: rolesReducer,
    matrices: matricesReducer,
    calculators: calculatorsReducer,
    charts: chartsReducer,
    implementations: implementationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
