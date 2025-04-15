import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getImplementations, getImplementation, createImplementation, updateImplementation, deleteImplementation, analyzeGaps } from '../../firebase/services/implementationService';

// Define types
export interface Implementation {
  id: string;
  name: string;
  organizationId: string;
  phases: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    description: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
  }[];
  milestones: {
    id: string;
    name: string;
    phaseId: string;
    date: Date;
    description: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
  }[];
  gaps: {
    id: string;
    type: 'department' | 'role' | 'skill' | 'headcount';
    description: string;
    impact: string;
    resolution: string;
    status: 'Identified' | 'In Progress' | 'Resolved';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface ImplementationsState {
  items: Implementation[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedImplementationId: string | null;
  gapAnalysisResults: any[] | null;
}

// Initial state
const initialState: ImplementationsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedImplementationId: null,
  gapAnalysisResults: null,
};

// Async thunks
export const fetchImplementations = createAsyncThunk(
  'implementations/fetchImplementations',
  async () => {
    return await getImplementations();
  }
);

export const fetchImplementation = createAsyncThunk(
  'implementations/fetchImplementation',
  async (id: string) => {
    return await getImplementation(id);
  }
);

export const addImplementation = createAsyncThunk(
  'implementations/addImplementation',
  async (implementation: Omit<Implementation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await createImplementation(implementation);
    return { id, ...implementation };
  }
);

export const editImplementation = createAsyncThunk(
  'implementations/editImplementation',
  async ({ id, data }: { id: string; data: Partial<Implementation> }) => {
    await updateImplementation(id, data);
    return { id, ...data };
  }
);

export const removeImplementation = createAsyncThunk(
  'implementations/removeImplementation',
  async (id: string) => {
    await deleteImplementation(id);
    return id;
  }
);

export const performGapAnalysis = createAsyncThunk(
  'implementations/performGapAnalysis',
  async ({ currentState, futureState }: { currentState: any; futureState: any }) => {
    return await analyzeGaps(currentState, futureState);
  }
);

// Create slice
const implementationsSlice = createSlice({
  name: 'implementations',
  initialState,
  reducers: {
    selectImplementation: (state, action: PayloadAction<string>) => {
      state.selectedImplementationId = action.payload;
    },
    clearSelectedImplementation: (state) => {
      state.selectedImplementationId = null;
    },
    clearGapAnalysisResults: (state) => {
      state.gapAnalysisResults = null;
    },
    updatePhaseStatus: (state, action: PayloadAction<{ implementationId: string; phaseId: string; status: 'Not Started' | 'In Progress' | 'Completed' }>) => {
      const { implementationId, phaseId, status } = action.payload;
      const implementation = state.items.find(impl => impl.id === implementationId);
      if (implementation) {
        const phase = implementation.phases.find(p => p.id === phaseId);
        if (phase) {
          phase.status = status;
        }
      }
    },
    updateMilestoneStatus: (state, action: PayloadAction<{ implementationId: string; milestoneId: string; status: 'Not Started' | 'In Progress' | 'Completed' }>) => {
      const { implementationId, milestoneId, status } = action.payload;
      const implementation = state.items.find(impl => impl.id === implementationId);
      if (implementation) {
        const milestone = implementation.milestones.find(m => m.id === milestoneId);
        if (milestone) {
          milestone.status = status;
        }
      }
    },
    updateGapStatus: (state, action: PayloadAction<{ implementationId: string; gapId: string; status: 'Identified' | 'In Progress' | 'Resolved' }>) => {
      const { implementationId, gapId, status } = action.payload;
      const implementation = state.items.find(impl => impl.id === implementationId);
      if (implementation) {
        const gap = implementation.gaps.find(g => g.id === gapId);
        if (gap) {
          gap.status = status;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch implementations
      .addCase(fetchImplementations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchImplementations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchImplementations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch implementations';
      })
      // Fetch single implementation
      .addCase(fetchImplementation.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(implementation => implementation.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      // Add implementation
      .addCase(addImplementation.fulfilled, (state, action) => {
        state.items.push(action.payload as Implementation);
      })
      // Edit implementation
      .addCase(editImplementation.fulfilled, (state, action) => {
        const { id } = action.payload;
        const index = state.items.findIndex(implementation => implementation.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Remove implementation
      .addCase(removeImplementation.fulfilled, (state, action) => {
        state.items = state.items.filter(implementation => implementation.id !== action.payload);
        if (state.selectedImplementationId === action.payload) {
          state.selectedImplementationId = null;
        }
      })
      // Perform gap analysis
      .addCase(performGapAnalysis.fulfilled, (state, action) => {
        state.gapAnalysisResults = action.payload;
      });
  },
});

// Export actions and reducer
export const { 
  selectImplementation, 
  clearSelectedImplementation, 
  clearGapAnalysisResults,
  updatePhaseStatus,
  updateMilestoneStatus,
  updateGapStatus
} = implementationsSlice.actions;
export default implementationsSlice.reducer;
