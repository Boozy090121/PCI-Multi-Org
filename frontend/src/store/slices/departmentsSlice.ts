import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, importDepartments } from '../../firebase/services/departmentService';

// Define types
export interface Department {
  id: string;
  name: string;
  color: string;
  order: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentsState {
  items: Department[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedDepartmentId: string | null;
}

// Initial state
const initialState: DepartmentsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedDepartmentId: null,
};

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async () => {
    return await getDepartments();
  }
);

export const addDepartment = createAsyncThunk(
  'departments/addDepartment',
  async (department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await createDepartment(department);
    return { id, ...department };
  }
);

export const editDepartment = createAsyncThunk(
  'departments/editDepartment',
  async ({ id, data }: { id: string; data: Partial<Department> }) => {
    await updateDepartment(id, data);
    return { id, ...data };
  }
);

export const removeDepartment = createAsyncThunk(
  'departments/removeDepartment',
  async (id: string) => {
    await deleteDepartment(id);
    return id;
  }
);

export const bulkImportDepartments = createAsyncThunk(
  'departments/bulkImportDepartments',
  async (departments: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    return await importDepartments(departments);
  }
);

// Create slice
const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    selectDepartment: (state, action: PayloadAction<string>) => {
      state.selectedDepartmentId = action.payload;
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartmentId = null;
    },
    reorderDepartments: (state, action: PayloadAction<{ id: string; newOrder: number }[]>) => {
      action.payload.forEach(({ id, newOrder }) => {
        const department = state.items.find(dept => dept.id === id);
        if (department) {
          department.order = newOrder;
        }
      });
      // Sort departments by order
      state.items.sort((a, b) => a.order - b.order);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch departments';
      })
      // Add department
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.items.push(action.payload as Department);
      })
      // Edit department
      .addCase(editDepartment.fulfilled, (state, action) => {
        const { id } = action.payload;
        const index = state.items.findIndex(dept => dept.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Remove department
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.items = state.items.filter(dept => dept.id !== action.payload);
        if (state.selectedDepartmentId === action.payload) {
          state.selectedDepartmentId = null;
        }
      })
      // Bulk import departments
      .addCase(bulkImportDepartments.fulfilled, (state) => {
        state.status = 'succeeded';
        // We'll refetch departments after bulk import to get the complete data
      });
  },
});

// Export actions and reducer
export const { selectDepartment, clearSelectedDepartment, reorderDepartments } = departmentsSlice.actions;
export default departmentsSlice.reducer;
