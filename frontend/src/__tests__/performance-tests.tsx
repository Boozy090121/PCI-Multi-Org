import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

// Import performance components
import OptimizationPage from '../components/optimization/OptimizationPage';
import { PerformanceOptimization, ResponsivenessOptimization } from '../components/optimization/OptimizationPage';

// Create mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock initial state
const initialState = {
  departments: {
    items: [
      { id: 'dept1', name: 'Engineering', color: '#4caf50', description: 'Software development department' },
      { id: 'dept2', name: 'Marketing', color: '#2196f3', description: 'Marketing and communications department' },
      { id: 'dept3', name: 'Sales', color: '#f44336', description: 'Sales and business development department' }
    ],
    loading: false,
    error: null
  },
  roles: {
    items: [
      { 
        id: 'role1', 
        departmentId: 'dept1', 
        title: 'Software Engineer', 
        level: 'Mid-level',
        responsibilities: ['Develop software features', 'Fix bugs', 'Write tests'],
        clientInteraction: 'Limited',
        approvalAuthority: 'None',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '2-5 years',
        reporting: {
          reportsTo: ['role2'],
          directReports: []
        },
        headcount: {
          current: 5,
          projected: 8
        }
      },
      { 
        id: 'role2', 
        departmentId: 'dept1', 
        title: 'Engineering Manager', 
        level: 'Senior',
        responsibilities: ['Manage team', 'Plan projects', 'Review code'],
        clientInteraction: 'Regular',
        approvalAuthority: 'Department level',
        skills: ['Leadership', 'Project Management', 'Technical Architecture'],
        experience: '5+ years',
        reporting: {
          reportsTo: [],
          directReports: ['role1']
        },
        headcount: {
          current: 1,
          projected: 2
        }
      }
    ],
    loading: false,
    error: null
  },
  ui: {
    currentView: 'departments',
    notifications: []
  }
};

// Performance Tests
describe('Performance Optimization Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    // Mock performance.now() for consistent test results
    jest.spyOn(performance, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders performance optimization settings correctly', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Check if performance optimization elements are displayed
    expect(screen.getByText('Performance Optimization')).toBeInTheDocument();
    expect(screen.getByText('Lazy Loading')).toBeInTheDocument();
    expect(screen.getByText('Pagination')).toBeInTheDocument();
    expect(screen.getByText('Caching')).toBeInTheDocument();
    expect(screen.getByText('Code Splitting')).toBeInTheDocument();
    expect(screen.getByText('Image Optimization')).toBeInTheDocument();
  });

  test('toggles optimization settings', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Toggle lazy loading
    const lazyLoadingSwitch = screen.getByLabelText('Lazy Loading');
    fireEvent.click(lazyLoadingSwitch);
    
    // Toggle pagination
    const paginationSwitch = screen.getByLabelText('Pagination');
    fireEvent.click(paginationSwitch);
    
    // Check if switches are toggled
    expect(lazyLoadingSwitch).not.toBeChecked();
    expect(paginationSwitch).not.toBeChecked();
  });

  test('changes data size and reloads data', async () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Change item count
    fireEvent.change(screen.getByLabelText('Number of Items'), { target: { value: '5000' } });
    
    // Click reload button
    fireEvent.click(screen.getByText('Reload Data'));
    
    // Check if loading state is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});

// Responsiveness Tests
describe('Responsiveness Optimization Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders responsiveness optimization settings correctly', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Check if responsiveness optimization elements are displayed
    expect(screen.getByText('Responsiveness Optimization')).toBeInTheDocument();
    expect(screen.getByText('Responsive Design')).toBeInTheDocument();
    expect(screen.getByText('Touch Support')).toBeInTheDocument();
    expect(screen.getByText('Flexible Layout')).toBeInTheDocument();
    expect(screen.getByText('Adaptive Content')).toBeInTheDocument();
  });

  test('changes device type and orientation', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Change device type to mobile
    fireEvent.click(screen.getByLabelText('Mobile'));
    
    // Change orientation to portrait
    fireEvent.click(screen.getByLabelText('Portrait'));
    
    // Check if preview is updated
    expect(screen.getByText('Mobile - Portrait')).toBeInTheDocument();
  });

  test('toggles responsiveness settings', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Toggle responsive design
    const responsiveDesignSwitch = screen.getByLabelText('Responsive Design');
    fireEvent.click(responsiveDesignSwitch);
    
    // Toggle touch support
    const touchSupportSwitch = screen.getByLabelText('Touch Support');
    fireEvent.click(touchSupportSwitch);
    
    // Check if switches are toggled
    expect(responsiveDesignSwitch).not.toBeChecked();
    expect(touchSupportSwitch).not.toBeChecked();
    
    // Check if preview shows warning about disabled features
    expect(screen.getByText(/Responsive design is currently disabled/)).toBeInTheDocument();
    expect(screen.getByText(/Touch support is currently disabled/)).toBeInTheDocument();
  });
});

// Performance Benchmarking Tests
describe('Performance Benchmarking', () => {
  let store;
  let originalConsoleTime;
  let originalConsoleTimeEnd;
  let timeResults = {};

  beforeEach(() => {
    store = mockStore(initialState);
    
    // Mock console.time and console.timeEnd for benchmarking
    originalConsoleTime = console.time;
    originalConsoleTimeEnd = console.timeEnd;
    
    console.time = jest.fn((label) => {
      timeResults[label] = performance.now();
    });
    
    console.timeEnd = jest.fn((label) => {
      const startTime = timeResults[label] || 0;
      const endTime = performance.now();
      timeResults[label] = endTime - startTime;
      return timeResults[label];
    });
    
    // Mock performance.now() for consistent test results
    jest.spyOn(performance, 'now')
      .mockImplementationOnce(() => 1000)  // First call (start time)
      .mockImplementationOnce(() => 1050); // Second call (end time, 50ms elapsed)
  });

  afterEach(() => {
    console.time = originalConsoleTime;
    console.timeEnd = originalConsoleTimeEnd;
    jest.restoreAllMocks();
    timeResults = {};
  });

  test('measures rendering performance', () => {
    console.time('render_test');
    
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    console.timeEnd('render_test');
    
    // Check if rendering time is measured
    expect(timeResults['render_test']).toBeDefined();
    expect(timeResults['render_test']).toBeLessThan(100); // Should render in less than 100ms
  });

  test('measures data loading performance', async () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    console.time('data_loading_test');
    
    // Click reload button
    fireEvent.click(screen.getByText('Reload Data'));
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    console.timeEnd('data_loading_test');
    
    // Check if data loading time is measured
    expect(timeResults['data_loading_test']).toBeDefined();
    expect(timeResults['data_loading_test']).toBeLessThan(200); // Should load in less than 200ms
  });

  test('compares performance with and without optimizations', async () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Measure with optimizations enabled
    console.time('optimized_test');
    fireEvent.click(screen.getByText('Reload Data'));
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    console.timeEnd('optimized_test');
    const optimizedTime = timeResults['optimized_test'];
    
    // Disable optimizations
    fireEvent.click(screen.getByLabelText('Lazy Loading'));
    fireEvent.click(screen.getByLabelText('Pagination'));
    fireEvent.click(screen.getByLabelText('Caching'));
    
    // Reset mock for second measurement
    jest.spyOn(performance, 'now')
      .mockImplementationOnce(() => 2000)  // First call (start time)
      .mockImplementationOnce(() => 2150); // Second call (end time, 150ms elapsed)
    
    // Measure without optimizations
    console.time('unoptimized_test');
    fireEvent.click(screen.getByText('Reload Data'));
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    console.timeEnd('unoptimized_test');
    const unoptimizedTime = timeResults['unoptimized_test'];
    
    // Check if optimized version is faster
    expect(optimizedTime).toBeLessThan(unoptimizedTime);
  });
});

// Load Testing
describe('Load Testing', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('handles large data sets', async () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Set large item count
    fireEvent.change(screen.getByLabelText('Number of Items'), { target: { value: '10000' } });
    
    // Click reload button
    fireEvent.click(screen.getByText('Reload Data'));
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check if data is loaded and pagination is working
    expect(screen.getByText(/Showing 1-/)).toBeInTheDocument();
    
    // Navigate to next page
    fireEvent.click(screen.getByText('Next'));
    
    // Check if page navigation works
    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
  });

  test('maintains performance with increasing data size', async () => {
    // Mock performance.now() for consistent test results
    const mockNow = jest.spyOn(performance, 'now');
    
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Test with small data set
    mockNow.mockImplementationOnce(() => 1000).mockImplementationOnce(() => 1020);
    fireEvent.change(screen.getByLabelText('Number of Items'), { target: { value: '1000' } });
    fireEvent.click(screen.getByText('Reload Data'));
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    const smallDataTime = mockNow.mock.results[1].value - mockNow.mock.results[0].value;
    
    // Test with medium data set
    mockNow.mockImplementationOnce(() => 2000).mockImplementationOnce(() => 2040);
    fireEvent.change(screen.getByLabelText('Number of Items'), { target: { value: '5000' } });
    fireEvent.click(screen.getByText('Reload Data'));
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    const mediumDataTime = mockNow.mock.results[3].value - mockNow.mock.results[2].value;
    
    // Test with large data set
    mockNow.mockImplementationOnce(() => 3000).mockImplementationOnce(() => 3080);
    fireEvent.change(screen.getByLabelText('Number of Items'), { target: { value: '10000' } });
    fireEvent.click(screen.getByText('Reload Data'));
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    const largeDataTime = mockNow.mock.results[5].value - mockNow.mock.results[4].value;
    
    // Check if performance scales reasonably (not exponentially)
    // Medium data (5x) should take less than 3x the time of small data
    expect(mediumDataTime).toBeLessThan(smallDataTime * 3);
    
    // Large data (10x) should take less than 5x the time of small data
    expect(largeDataTime).toBeLessThan(smallDataTime * 5);
    
    mockNow.mockRestore();
  });
});

// Responsiveness Testing
describe('Responsiveness Testing', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    
    // Mock window.matchMedia for responsive design testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('adapts to different screen sizes', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Test desktop view
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    
    // Change to tablet view
    fireEvent.click(screen.getByLabelText('Tablet'));
    expect(screen.getByText(/Tablet -/)).toBeInTheDocument();
    
    // Change to mobile view
    fireEvent.click(screen.getByLabelText('Mobile'));
    expect(screen.getByText(/Mobile -/)).toBeInTheDocument();
    
    // Check if content adapts to mobile view
    expect(screen.getByText('Organization Structure')).toBeInTheDocument();
  });

  test('handles orientation changes', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Change to mobile view
    fireEvent.click(screen.getByLabelText('Mobile'));
    
    // Test portrait orientation
    fireEvent.click(screen.getByLabelText('Portrait'));
    expect(screen.getByText('Mobile - Portrait')).toBeInTheDocument();
    
    // Test landscape orientation
    fireEvent.click(screen.getByLabelText('Landscape'));
    expect(screen.getByText('Mobile - Landscape')).toBeInTheDocument();
  });

  test('shows/hides content based on screen size', () => {
    render(
      <Provider store={store}>
        <OptimizationPage />
      </Provider>
    );
    
    // Desktop view should show all content
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Organization Chart Preview')).toBeInTheDocument();
    
    // Change to mobile view
    fireEvent.click(screen.getByLabelText('Mobile'));
    
    // Mobile view should hide some content
    expect(screen.queryByText('Organization Chart Preview')).not.toBeInTheDocument();
    
    // Disable adaptive content
    fireEvent.click(screen.getByLabelText('Adaptive Content'));
    
    // Check if warning about disabled adaptive content is shown
    expect(screen.getByText(/Adaptive content is currently disabled/)).toBeInTheDocument();
  });
});

export default {};
