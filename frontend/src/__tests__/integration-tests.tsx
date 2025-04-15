import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';

// Import main application components
import App from '../App';
import { Routes } from '../routes';

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
  matrices: {
    items: [
      {
        id: 'matrix1',
        name: 'RACI Matrix',
        type: 'raci',
        cells: [
          { roleId: 'role1', responsibilityId: 'resp1', value: 'R' },
          { roleId: 'role2', responsibilityId: 'resp1', value: 'A' }
        ]
      }
    ],
    loading: false,
    error: null
  },
  calculators: {
    items: [
      {
        id: 'calc1',
        name: 'Engineering Headcount',
        departmentId: 'dept1',
        parameters: {
          workOrders: 1000,
          handlingTime: 30,
          complexity: 0.8,
          growth: 0.15
        },
        results: {
          current: 6,
          projected: 10
        }
      }
    ],
    loading: false,
    error: null
  },
  charts: {
    items: [
      {
        id: 'chart1',
        name: 'Main Org Chart',
        layout: 'vertical',
        showHeadcount: true,
        showVacancies: true
      }
    ],
    loading: false,
    error: null
  },
  implementations: {
    items: [
      {
        id: 'impl1',
        name: 'Q3 Reorganization',
        status: 'in-progress',
        tasks: [
          { id: 'task1', name: 'Identify gaps', status: 'completed' },
          { id: 'task2', name: 'Create implementation plan', status: 'in-progress' }
        ]
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

// Mock Firebase
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn().mockReturnValue({
      firestore: jest.fn()
    })
  };
});

jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn().mockResolvedValue({
      docs: []
    }),
    getDoc: jest.fn().mockResolvedValue({
      exists: jest.fn().mockReturnValue(true),
      data: jest.fn().mockReturnValue({})
    }),
    setDoc: jest.fn().mockResolvedValue({}),
    updateDoc: jest.fn().mockResolvedValue({}),
    deleteDoc: jest.fn().mockResolvedValue({}),
    onSnapshot: jest.fn().mockReturnValue(jest.fn())
  };
});

// Integration Tests
describe('Application Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('navigates between main sections', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if departments section is initially displayed
    expect(screen.getByText('Department & Role Management')).toBeInTheDocument();
    
    // Navigate to alignment section
    fireEvent.click(screen.getByText('Cross-Departmental Alignment'));
    
    // Check if alignment section is displayed
    await waitFor(() => {
      expect(screen.getByText('Responsibility Matrix')).toBeInTheDocument();
    });
    
    // Navigate to headcount section
    fireEvent.click(screen.getByText('Headcount Calculator'));
    
    // Check if headcount section is displayed
    await waitFor(() => {
      expect(screen.getByText('Metrics-Based Calculator')).toBeInTheDocument();
    });
  });

  test('department and role integration', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Create a new department
    fireEvent.click(screen.getByText('Add Department'));
    fireEvent.change(screen.getByLabelText('Department Name'), { target: { value: 'Finance' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Financial operations department' } });
    fireEvent.click(screen.getByText('Save Department'));
    
    // Check if action was dispatched
    const departmentActions = store.getActions().filter(action => action.type.startsWith('departments/'));
    expect(departmentActions).toContainEqual(expect.objectContaining({
      type: 'departments/addDepartment',
      payload: expect.objectContaining({
        name: 'Finance',
        description: 'Financial operations department'
      })
    }));
    
    // Select the new department and add a role
    fireEvent.click(screen.getByText('Finance'));
    fireEvent.click(screen.getByText('Add Role'));
    fireEvent.change(screen.getByLabelText('Role Title'), { target: { value: 'Financial Analyst' } });
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'Mid-level' } });
    fireEvent.click(screen.getByText('Save Role'));
    
    // Check if action was dispatched
    const roleActions = store.getActions().filter(action => action.type.startsWith('roles/'));
    expect(roleActions).toContainEqual(expect.objectContaining({
      type: 'roles/addRole',
      payload: expect.objectContaining({
        title: 'Financial Analyst',
        level: 'Mid-level'
      })
    }));
  });

  test('matrix and role integration', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Navigate to alignment section
    fireEvent.click(screen.getByText('Cross-Departmental Alignment'));
    
    // Create a new matrix
    fireEvent.click(screen.getByText('Create Matrix'));
    fireEvent.change(screen.getByLabelText('Matrix Name'), { target: { value: 'New RACI Matrix' } });
    fireEvent.change(screen.getByLabelText('Matrix Type'), { target: { value: 'raci' } });
    fireEvent.click(screen.getByText('Save Matrix'));
    
    // Check if action was dispatched
    const matrixActions = store.getActions().filter(action => action.type.startsWith('matrices/'));
    expect(matrixActions).toContainEqual(expect.objectContaining({
      type: 'matrices/addMatrix',
      payload: expect.objectContaining({
        name: 'New RACI Matrix',
        type: 'raci'
      })
    }));
    
    // Add a cell to the matrix
    fireEvent.click(screen.getByText('Edit Matrix'));
    fireEvent.click(screen.getByTestId('cell-role1-resp1'));
    fireEvent.click(screen.getByText('R'));
    
    // Check if action was dispatched
    expect(matrixActions).toContainEqual(expect.objectContaining({
      type: 'matrices/updateMatrixCell',
      payload: expect.objectContaining({
        roleId: 'role1',
        responsibilityId: 'resp1',
        value: 'R'
      })
    }));
  });

  test('headcount calculator and department integration', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Navigate to headcount section
    fireEvent.click(screen.getByText('Headcount Calculator'));
    
    // Create a new calculator
    fireEvent.click(screen.getByText('Create Calculator'));
    fireEvent.change(screen.getByLabelText('Calculator Name'), { target: { value: 'Marketing Headcount' } });
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'dept2' } });
    fireEvent.change(screen.getByLabelText('Work Orders'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Handling Time'), { target: { value: '45' } });
    fireEvent.click(screen.getByText('Calculate'));
    
    // Check if action was dispatched
    const calculatorActions = store.getActions().filter(action => action.type.startsWith('calculators/'));
    expect(calculatorActions).toContainEqual(expect.objectContaining({
      type: 'calculators/addCalculator',
      payload: expect.objectContaining({
        name: 'Marketing Headcount',
        departmentId: 'dept2'
      })
    }));
  });

  test('org chart and role integration', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Navigate to org chart section
    fireEvent.click(screen.getByText('Organizational Chart'));
    
    // Create a new chart
    fireEvent.click(screen.getByText('Create Chart'));
    fireEvent.change(screen.getByLabelText('Chart Name'), { target: { value: 'Executive Chart' } });
    fireEvent.click(screen.getByLabelText('Show Headcount'));
    fireEvent.click(screen.getByText('Save Chart'));
    
    // Check if action was dispatched
    const chartActions = store.getActions().filter(action => action.type.startsWith('charts/'));
    expect(chartActions).toContainEqual(expect.objectContaining({
      type: 'charts/addChart',
      payload: expect.objectContaining({
        name: 'Executive Chart',
        showHeadcount: true
      })
    }));
  });

  test('gap analysis and implementation integration', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Navigate to gap analysis section
    fireEvent.click(screen.getByText('Gap Analysis'));
    
    // Identify gaps
    fireEvent.click(screen.getByText('Identify Gaps'));
    
    // Create implementation plan
    fireEvent.click(screen.getByText('Create Implementation Plan'));
    fireEvent.change(screen.getByLabelText('Plan Name'), { target: { value: 'Q4 Implementation' } });
    fireEvent.click(screen.getByText('Save Plan'));
    
    // Check if action was dispatched
    const implementationActions = store.getActions().filter(action => action.type.startsWith('implementations/'));
    expect(implementationActions).toContainEqual(expect.objectContaining({
      type: 'implementations/addImplementation',
      payload: expect.objectContaining({
        name: 'Q4 Implementation'
      })
    }));
  });
});

// End-to-End Flow Tests
describe('End-to-End Flow Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('complete department and role creation flow', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Step 1: Create a department
    fireEvent.click(screen.getByText('Add Department'));
    fireEvent.change(screen.getByLabelText('Department Name'), { target: { value: 'Human Resources' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'HR department' } });
    fireEvent.change(screen.getByLabelText('Color'), { target: { value: '#9c27b0' } });
    fireEvent.click(screen.getByText('Save Department'));
    
    // Step 2: Select the department and add a role
    fireEvent.click(screen.getByText('Human Resources'));
    fireEvent.click(screen.getByText('Add Role'));
    fireEvent.change(screen.getByLabelText('Role Title'), { target: { value: 'HR Manager' } });
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'Senior' } });
    
    // Add responsibilities
    fireEvent.change(screen.getByLabelText('Responsibilities'), { 
      target: { value: 'Manage HR team\nOversee recruitment\nDevelop HR policies' } 
    });
    
    // Add client interaction
    fireEvent.change(screen.getByLabelText('Client Interaction'), { 
      target: { value: 'Regular interaction with department heads' } 
    });
    
    // Add approval authority
    fireEvent.change(screen.getByLabelText('Approval Authority'), { 
      target: { value: 'HR budget up to $10,000' } 
    });
    
    // Add skills
    fireEvent.change(screen.getByLabelText('Skills'), { 
      target: { value: 'Leadership\nRecruitment\nEmployee Relations' } 
    });
    
    // Add experience
    fireEvent.change(screen.getByLabelText('Experience'), { 
      target: { value: '5+ years in HR management' } 
    });
    
    // Add headcount
    fireEvent.change(screen.getByLabelText('Current Headcount'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Projected Headcount'), { target: { value: '2' } });
    
    // Save role
    fireEvent.click(screen.getByText('Save Role'));
    
    // Step 3: Add another role
    fireEvent.click(screen.getByText('Add Role'));
    fireEvent.change(screen.getByLabelText('Role Title'), { target: { value: 'HR Specialist' } });
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'Mid-level' } });
    
    // Add responsibilities
    fireEvent.change(screen.getByLabelText('Responsibilities'), { 
      target: { value: 'Recruitment\nOnboarding\nEmployee relations' } 
    });
    
    // Add client interaction
    fireEvent.change(screen.getByLabelText('Client Interaction'), { 
      target: { value: 'Regular interaction with employees' } 
    });
    
    // Add approval authority
    fireEvent.change(screen.getByLabelText('Approval Authority'), { 
      target: { value: 'No approval authority' } 
    });
    
    // Add skills
    fireEvent.change(screen.getByLabelText('Skills'), { 
      target: { value: 'Recruitment\nOnboarding\nHRIS' } 
    });
    
    // Add experience
    fireEvent.change(screen.getByLabelText('Experience'), { 
      target: { value: '2-5 years in HR' } 
    });
    
    // Add reporting relationship
    fireEvent.change(screen.getByLabelText('Reports To'), { target: { value: 'HR Manager' } });
    
    // Add headcount
    fireEvent.change(screen.getByLabelText('Current Headcount'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Projected Headcount'), { target: { value: '3' } });
    
    // Save role
    fireEvent.click(screen.getByText('Save Role'));
    
    // Check if actions were dispatched in the correct sequence
    const actions = store.getActions();
    
    // Department creation action
    expect(actions).toContainEqual(expect.objectContaining({
      type: 'departments/addDepartment',
      payload: expect.objectContaining({
        name: 'Human Resources',
        description: 'HR department',
        color: '#9c27b0'
      })
    }));
    
    // First role creation action
    expect(actions).toContainEqual(expect.objectContaining({
      type: 'roles/addRole',
      payload: expect.objectContaining({
        title: 'HR Manager',
        level: 'Senior'
      })
    }));
    
    // Second role creation action
    expect(actions).toContainEqual(expect.objectContaining({
      type: 'roles/addRole',
      payload: expect.objectContaining({
        title: 'HR Specialist',
        level: 'Mid-level'
      })
    }));
  });

  test('complete organization structure creation flow', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Provider>
    );
    
    // Step 1: Create departments and roles (simplified for test)
    fireEvent.click(screen.getByText('Add Department'));
    fireEvent.change(screen.getByLabelText('Department Name'), { target: { value: 'Executive' } });
    fireEvent.click(screen.getByText('Save Department'));
    
    fireEvent.click(screen.getByText('Executive'));
    fireEvent.click(screen.getByText('Add Role'));
    fireEvent.change(screen.getByLabelText('Role Title'), { target: { value: 'CEO' } });
    fireEvent.click(screen.getByText('Save Role'));
    
    // Step 2: Navigate to responsibility matrix
    fireEvent.click(screen.getByText('Cross-Departmental Alignment'));
    fireEvent.click(screen.getByText('Create Matrix'));
    fireEvent.change(screen.getByLabelText('Matrix Name'), { target: { value: 'Executive RACI' } });
    fireEvent.click(screen.getByText('Save Matrix'));
    
    // Step 3: Navigate to headcount calculator
    fireEvent.click(screen.getByText('Headcount Calculator'));
    fireEvent.click(screen.getByText('Create Calculator'));
    fireEvent.change(screen.getByLabelText('Calculator Name'), { target: { value: 'Executive Headcount' } });
    fireEvent.click(screen.getByText('Calculate'));
    
    // Step 4: Navigate to org chart
    fireEvent.click(screen.getByText('Organizational Chart'));
    fireEvent.click(screen.getByText('Create Chart'));
    fireEvent.change(screen.getByLabelText('Chart Name'), { target: { value: 'Company Structure' } });
    fireEvent.click(screen.getByText('Save Chart'));
    
    // Step 5: Navigate to gap analysis
    fireEvent.click(screen.getByText('Gap Analysis'));
    fireEvent.click(screen.getByText('Identify Gaps'));
    fireEvent.click(screen.getByText('Create Implementation Plan'));
    fireEvent.change(screen.getByLabelText('Plan Name'), { target: { value: 'Company Reorganization' } });
    fireEvent.click(screen.getByText('Save Plan'));
    
    // Check if all necessary actions were dispatched
    const actions = store.getActions();
    const actionTypes = actions.map(action => action.type);
    
    // Check for department and role actions
    expect(actionTypes).toContain('departments/addDepartment');
    expect(actionTypes).toContain('roles/addRole');
    
    // Check for matrix actions
    expect(actionTypes).toContain('matrices/addMatrix');
    
    // Check for calculator actions
    expect(actionTypes).toContain('calculators/addCalculator');
    
    // Check for chart actions
    expect(actionTypes).toContain('charts/addChart');
    
    // Check for implementation actions
    expect(actionTypes).toContain('implementations/addImplementation');
  });
});

export default {};
