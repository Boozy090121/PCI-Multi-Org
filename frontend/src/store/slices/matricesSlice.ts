import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getMatrices, getMatrix, createMatrix, updateMatrix, deleteMatrix } from '../../firebase/services/matrixService';

// Define types
export interface Matrix {
  id: string;
  name: string;
  type: 'RACI' | 'responsibility' | 'interaction';
  organizationId: string;
  data: {
    rows: {
      id: string;
      label: string;
      description: string;
    }[];
    columns: {
      id: string;
      roleId: string;
      departmentId: string;
    }[];
    cells: {
      rowId: string;
      columnId: string;
      value: string;
      notes: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface MatricesState {
  items: Matrix[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedMatrixId: string | null;
  currentMatrixType: 'RACI' | 'responsibility' | 'interaction' | null;
}

// Initial state
const initialState: MatricesState = {
  items: [],
  status: 'idle',
  error: null,
  selectedMatrixId: null,
  currentMatrixType: null,
};

// Async thunks
export const fetchMatrices = createAsyncThunk(
  'matrices/fetchMatrices',
  async (type: 'RACI' | 'responsibility' | 'interaction') => {
    return await getMatrices(type);
  }
);

export const fetchMatrix = createAsyncThunk(
  'matrices/fetchMatrix',
  async (id: string) => {
    return await getMatrix(id);
  }
);

export const addMatrix = createAsyncThunk(
  'matrices/addMatrix',
  async (matrix: Omit<Matrix, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await createMatrix(matrix);
    return { id, ...matrix };
  }
);

export const editMatrix = createAsyncThunk(
  'matrices/editMatrix',
  async ({ id, data }: { id: string; data: Partial<Matrix> }) => {
    await updateMatrix(id, data);
    return { id, ...data };
  }
);

export const removeMatrix = createAsyncThunk(
  'matrices/removeMatrix',
  async (id: string) => {
    await deleteMatrix(id);
    return id;
  }
);

// Create slice
const matricesSlice = createSlice({
  name: 'matrices',
  initialState,
  reducers: {
    selectMatrix: (state, action: PayloadAction<string>) => {
      state.selectedMatrixId = action.payload;
    },
    clearSelectedMatrix: (state) => {
      state.selectedMatrixId = null;
    },
    setCurrentMatrixType: (state, action: PayloadAction<'RACI' | 'responsibility' | 'interaction'>) => {
      state.currentMatrixType = action.payload;
    },
    updateCell: (state, action: PayloadAction<{ matrixId: string; rowId: string; columnId: string; value: string; notes?: string }>) => {
      const { matrixId, rowId, columnId, value, notes } = action.payload;
      const matrix = state.items.find(m => m.id === matrixId);
      if (matrix) {
        const cellIndex = matrix.data.cells.findIndex(cell => cell.rowId === rowId && cell.columnId === columnId);
        if (cellIndex !== -1) {
          matrix.data.cells[cellIndex].value = value;
          if (notes !== undefined) {
            matrix.data.cells[cellIndex].notes = notes;
          }
        } else {
          matrix.data.cells.push({
            rowId,
            columnId,
            value,
            notes: notes || '',
          });
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch matrices
      .addCase(fetchMatrices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMatrices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMatrices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch matrices';
      })
      // Fetch single matrix
      .addCase(fetchMatrix.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(matrix => matrix.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      // Add matrix
      .addCase(addMatrix.fulfilled, (state, action) => {
        state.items.push(action.payload as Matrix);
      })
      // Edit matrix
      .addCase(editMatrix.fulfilled, (state, action) => {
        const { id } = action.payload;
        const index = state.items.findIndex(matrix => matrix.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Remove matrix
      .addCase(removeMatrix.fulfilled, (state, action) => {
        state.items = state.items.filter(matrix => matrix.id !== action.payload);
        if (state.selectedMatrixId === action.payload) {
          state.selectedMatrixId = null;
        }
      });
  },
});

// Export actions and reducer
export const { 
  selectMatrix, 
  clearSelectedMatrix, 
  setCurrentMatrixType,
  updateCell
} = matricesSlice.actions;
export default matricesSlice.reducer;
