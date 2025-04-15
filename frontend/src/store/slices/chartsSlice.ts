import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getCharts, getChart, createChart, updateChart, deleteChart } from '../../firebase/services/chartService';

// Define types
export interface Chart {
  id: string;
  name: string;
  type: 'vertical' | 'horizontal' | 'radial';
  organizationId: string;
  data: {
    nodes: {
      id: string;
      roleId?: string;
      departmentId?: string;
      label: string;
      type: 'role' | 'department' | 'custom';
      position: {
        x: number;
        y: number;
      };
    }[];
    edges: {
      id: string;
      source: string;
      target: string;
      type: 'direct' | 'dotted';
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ChartsState {
  items: Chart[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedChartId: string | null;
  currentViewType: 'vertical' | 'horizontal' | 'radial';
}

// Initial state
const initialState: ChartsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedChartId: null,
  currentViewType: 'vertical',
};

// Async thunks
export const fetchCharts = createAsyncThunk(
  'charts/fetchCharts',
  async () => {
    return await getCharts();
  }
);

export const fetchChart = createAsyncThunk(
  'charts/fetchChart',
  async (id: string) => {
    return await getChart(id);
  }
);

export const addChart = createAsyncThunk(
  'charts/addChart',
  async (chart: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await createChart(chart);
    return { id, ...chart };
  }
);

export const editChart = createAsyncThunk(
  'charts/editChart',
  async ({ id, data }: { id: string; data: Partial<Chart> }) => {
    await updateChart(id, data);
    return { id, ...data };
  }
);

export const removeChart = createAsyncThunk(
  'charts/removeChart',
  async (id: string) => {
    await deleteChart(id);
    return id;
  }
);

// Create slice
const chartsSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    selectChart: (state, action: PayloadAction<string>) => {
      state.selectedChartId = action.payload;
    },
    clearSelectedChart: (state) => {
      state.selectedChartId = null;
    },
    setViewType: (state, action: PayloadAction<'vertical' | 'horizontal' | 'radial'>) => {
      state.currentViewType = action.payload;
    },
    updateNodePosition: (state, action: PayloadAction<{ chartId: string; nodeId: string; position: { x: number; y: number } }>) => {
      const { chartId, nodeId, position } = action.payload;
      const chart = state.items.find(c => c.id === chartId);
      if (chart) {
        const node = chart.data.nodes.find(n => n.id === nodeId);
        if (node) {
          node.position = position;
        }
      }
    },
    addNode: (state, action: PayloadAction<{ chartId: string; node: Omit<Chart['data']['nodes'][0], 'id'> & { id?: string } }>) => {
      const { chartId, node } = action.payload;
      const chart = state.items.find(c => c.id === chartId);
      if (chart) {
        const nodeId = node.id || `node-${Date.now()}`;
        chart.data.nodes.push({
          ...node,
          id: nodeId,
        });
      }
    },
    removeNode: (state, action: PayloadAction<{ chartId: string; nodeId: string }>) => {
      const { chartId, nodeId } = action.payload;
      const chart = state.items.find(c => c.id === chartId);
      if (chart) {
        chart.data.nodes = chart.data.nodes.filter(n => n.id !== nodeId);
        // Also remove any edges connected to this node
        chart.data.edges = chart.data.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      }
    },
    addEdge: (state, action: PayloadAction<{ chartId: string; edge: Omit<Chart['data']['edges'][0], 'id'> & { id?: string } }>) => {
      const { chartId, edge } = action.payload;
      const chart = state.items.find(c => c.id === chartId);
      if (chart) {
        const edgeId = edge.id || `edge-${Date.now()}`;
        chart.data.edges.push({
          ...edge,
          id: edgeId,
        });
      }
    },
    removeEdge: (state, action: PayloadAction<{ chartId: string; edgeId: string }>) => {
      const { chartId, edgeId } = action.payload;
      const chart = state.items.find(c => c.id === chartId);
      if (chart) {
        chart.data.edges = chart.data.edges.filter(e => e.id !== edgeId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch charts
      .addCase(fetchCharts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCharts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCharts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch charts';
      })
      // Fetch single chart
      .addCase(fetchChart.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(chart => chart.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      // Add chart
      .addCase(addChart.fulfilled, (state, action) => {
        state.items.push(action.payload as Chart);
      })
      // Edit chart
      .addCase(editChart.fulfilled, (state, action) => {
        const { id } = action.payload;
        const index = state.items.findIndex(chart => chart.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Remove chart
      .addCase(removeChart.fulfilled, (state, action) => {
        state.items = state.items.filter(chart => chart.id !== action.payload);
        if (state.selectedChartId === action.payload) {
          state.selectedChartId = null;
        }
      });
  },
});

// Export actions and reducer
export const { 
  selectChart, 
  clearSelectedChart, 
  setViewType,
  updateNodePosition,
  addNode,
  removeNode,
  addEdge,
  removeEdge
} = chartsSlice.actions;
export default chartsSlice.reducer;
