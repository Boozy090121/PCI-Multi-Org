import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getCalculators, getCalculator, createCalculator, updateCalculator, deleteCalculator, runSimulation } from '../../firebase/services/calculatorService';

// Define types
export interface Calculator {
  id: string;
  name: string;
  organizationId: string;
  inputs: {
    workOrdersPerDay: number;
    avgHandlingTime: number;
    complaintVolume: number;
    complexityFactor: number;
    growthRate: number;
    efficiencyFactor: number;
    absencePercentage: number;
    trainingTime: number;
    regulatoryOverhead: number;
  };
  results: {
    recommendedHeadcount: number;
    departmentBreakdown: {
      departmentId: string;
      headcount: number;
    }[];
    timestamp: Date;
  } | null;
  scenarios: {
    id: string;
    name: string;
    inputs: any;
    results: any;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface CalculatorsState {
  items: Calculator[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedCalculatorId: string | null;
  currentScenarioId: string | null;
}

// Initial state
const initialState: CalculatorsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedCalculatorId: null,
  currentScenarioId: null,
};

// Async thunks
export const fetchCalculators = createAsyncThunk(
  'calculators/fetchCalculators',
  async () => {
    return await getCalculators();
  }
);

export const fetchCalculator = createAsyncThunk(
  'calculators/fetchCalculator',
  async (id: string) => {
    return await getCalculator(id);
  }
);

export const addCalculator = createAsyncThunk(
  'calculators/addCalculator',
  async (calculator: Omit<Calculator, 'id' | 'results' | 'scenarios' | 'createdAt' | 'updatedAt'>) => {
    const id = await createCalculator(calculator);
    return { id, ...calculator, results: null, scenarios: [] };
  }
);

export const editCalculator = createAsyncThunk(
  'calculators/editCalculator',
  async ({ id, data }: { id: string; data: Partial<Calculator> }) => {
    await updateCalculator(id, data);
    return { id, ...data };
  }
);

export const removeCalculator = createAsyncThunk(
  'calculators/removeCalculator',
  async (id: string) => {
    await deleteCalculator(id);
    return id;
  }
);

export const executeSimulation = createAsyncThunk(
  'calculators/executeSimulation',
  async ({ id, inputs }: { id: string; inputs: any }) => {
    return await runSimulation(id, inputs);
  }
);

// Create slice
const calculatorsSlice = createSlice({
  name: 'calculators',
  initialState,
  reducers: {
    selectCalculator: (state, action: PayloadAction<string>) => {
      state.selectedCalculatorId = action.payload;
    },
    clearSelectedCalculator: (state) => {
      state.selectedCalculatorId = null;
    },
    selectScenario: (state, action: PayloadAction<string>) => {
      state.currentScenarioId = action.payload;
    },
    clearSelectedScenario: (state) => {
      state.currentScenarioId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch calculators
      .addCase(fetchCalculators.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCalculators.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCalculators.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch calculators';
      })
      // Fetch single calculator
      .addCase(fetchCalculator.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(calculator => calculator.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      // Add calculator
      .addCase(addCalculator.fulfilled, (state, action) => {
        state.items.push(action.payload as Calculator);
      })
      // Edit calculator
      .addCase(editCalculator.fulfilled, (state, action) => {
        const { id } = action.payload;
        const index = state.items.findIndex(calculator => calculator.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Remove calculator
      .addCase(removeCalculator.fulfilled, (state, action) => {
        state.items = state.items.filter(calculator => calculator.id !== action.payload);
        if (state.selectedCalculatorId === action.payload) {
          state.selectedCalculatorId = null;
        }
      })
      // Execute simulation
      .addCase(executeSimulation.fulfilled, (state, action) => {
        const calculator = state.items.find(calc => calc.id === state.selectedCalculatorId);
        if (calculator) {
          // Update the calculator with the new scenario and results
          calculator.scenarios.push(action.payload);
          calculator.results = action.payload.results;
          state.currentScenarioId = action.payload.id;
        }
      });
  },
});

// Export actions and reducer
export const { 
  selectCalculator, 
  clearSelectedCalculator, 
  selectScenario, 
  clearSelectedScenario 
} = calculatorsSlice.actions;
export default calculatorsSlice.reducer;
