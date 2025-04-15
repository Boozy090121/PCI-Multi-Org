import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getRoles, getRole, createRole, updateRole, deleteRole, cloneRole } from '../../firebase/services/roleService';

// Define types
export interface Role {
  id: string;
  title: string;
  level: string;
  departmentId: string;
  organizationId: string;
  responsibilities: {
    id: string;
    description: string;
    category: string;
  }[];
  clientInteraction: {
    level: string;
    description: string;
    limitations: string[];
  };
  approvalAuthorities: {
    id: string;
    documentType: string;
    approvalLimit: number;
    description: string;
  }[];
  skills: {
    id: string;
    name: string;
    level: string;
    essential: boolean;
  }[];
  experience: {
    minimum: number;
    preferred: number;
    description: string;
  };
  reporting: {
    reportsTo: string[];
    directReports: string[];
    dottedLineReports: string[];
  };
  headcount: {
    current: number;
    projected: number;
    justification: string;
  };
  versions: {
    timestamp: Date;
    data: any;
    changedBy: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface RolesState {
  items: Role[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedRoleId: string | null;
  comparisonRoles: {
    role1Id: string | null;
    role2Id: string | null;
  };
}

// Initial state
const initialState: RolesState = {
  items: [],
  status: 'idle',
  error: null,
  selectedRoleId: null,
  comparisonRoles: {
    role1Id: null,
    role2Id: null,
  },
};

// Async thunks
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (departmentId: string) => {
    return await getRoles(departmentId);
  }
);

export const fetchRole = createAsyncThunk(
  'roles/fetchRole',
  async (id: string) => {
    return await getRole(id);
  }
);

export const addRole = createAsyncThunk(
  'roles/addRole',
  async (role: Omit<Role, 'id' | 'versions' | 'createdAt' | 'updatedAt'>) => {
    const id = await createRole(role);
    return { id, ...role };
  }
);

export const editRole = createAsyncThunk(
  'roles/editRole',
  async ({ id, data }: { id: string; data: Partial<Role> }) => {
    await updateRole(id, data);
    return { id, ...data };
  }
);

export const removeRole = createAsyncThunk(
  'roles/removeRole',
  async (id: string) => {
    await deleteRole(id);
    return id;
  }
);

export const duplicateRole = createAsyncThunk(
  'roles/duplicateRole',
  async (id: string) => {
    const newId = await cloneRole(id);
    return { originalId: id, newId };
  }
);

// Create slice
const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    selectRole: (state, action: PayloadAction<string>) => {
      state.selectedRoleId = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRoleId = null;
    },
    setComparisonRole1: (state, action: PayloadAction<string>) => {
      state.comparisonRoles.role1Id = action.payload;
    },
    setComparisonRole2: (state, action: PayloadAction<string>) => {
      state.comparisonRoles.role2Id = action.payload;
    },
    clearComparisonRoles: (state) => {
      state.comparisonRoles = {
        role1Id: null,
        role2Id: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch roles';
      })
      // Fetch single role
      .addCase(fetchRole.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(role => role.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      // Add role
      .addCase(addRole.fulfilled, (state, action) => {
        state.items.push(action.payload as Role);
      })
      // Edit role
      .addCase(editRole.fulfilled, (state, action) => {
        const { id } = action.payload;
        const index = state.items.findIndex(role => role.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Remove role
      .addCase(removeRole.fulfilled, (state, action) => {
        state.items = state.items.filter(role => role.id !== action.payload);
        if (state.selectedRoleId === action.payload) {
          state.selectedRoleId = null;
        }
        if (state.comparisonRoles.role1Id === action.payload) {
          state.comparisonRoles.role1Id = null;
        }
        if (state.comparisonRoles.role2Id === action.payload) {
          state.comparisonRoles.role2Id = null;
        }
      })
      // Duplicate role
      .addCase(duplicateRole.fulfilled, (state) => {
        // We'll refetch roles after duplication to get the complete data
        state.status = 'idle';
      });
  },
});

// Export actions and reducer
export const { 
  selectRole, 
  clearSelectedRole, 
  setComparisonRole1, 
  setComparisonRole2, 
  clearComparisonRoles 
} = rolesSlice.actions;
export default rolesSlice.reducer;
