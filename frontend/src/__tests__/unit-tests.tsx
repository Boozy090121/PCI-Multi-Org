import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// Mock components for testing
import DepartmentEditor from '../components/departments/DepartmentEditor';
import RoleManager from '../components/roles/RoleManager';
import ResponsibilityMatrix from '../components/alignment/ResponsibilityMatrix';
import HeadcountCalculator from '../components/headcount/HeadcountCalculator';
import OrganizationalChart from '../components/orgchart/OrganizationalChart';
import GapAnalysis from '../components/gap-analysis/GapAnalysis';
import UserOnboarding from '../components/common/UserOnboarding';
import SecurityImplementation from '../components/security/SecurityImplementation';

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
    items: [],
    loading: false,
    error: null
  },
  calculators: {
    items: [],
    loading: false,
    error: null
  },
  charts: {
    items: [],
    loading: false,
    error: null
  },
  implementations: {
    items: [],
    loading: false,
    error: null
  },
  ui: {
    currentView: 'departments',
    notifications: []
  }
};

// Department Editor Tests
describe('DepartmentEditor Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders department list correctly', () => {
    render(
      <Provider store={store}>
        <DepartmentEditor />
      </Provider>
    );
    
    // Check if department names are displayed
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  test('allows adding a new department', async () => {
    render(
      <Provider store={store}>
        <DepartmentEditor />
      </Provider>
    );
    
    // Click add department button
    fireEvent.click(screen.getByText('Add Department'));
    
    // Fill in department form
    fireEvent.change(screen.getByLabelText('Department Name'), { target: { value: 'Finance' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Financial operations department' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Department'));
    
    // Check if action was dispatched
    const actions = store.getActions();
    expect(actions).toContainEqual(expect.objectContaining({
      type: 'departments/addDepartment',
      payload: expect.objectContaining({
        name: 'Finance',
        description: 'Financial operations department'
      })
    }));
  });
});

// Role Manager Tests
describe('RoleManager Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders role list correctly', () => {
    render(
      <Provider store={store}>
        <RoleManager />
      </Provider>
    );
    
    // Check if role titles are displayed
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument();
  });

  test('displays role details when selected', () => {
    render(
      <Provider store={store}>
        <RoleManager />
      </Provider>
    );
    
    // Click on a role
    fireEvent.click(screen.getByText('Software Engineer'));
    
    // Check if role details are displayed
    expect(screen.getByText('Responsibilities:')).toBeInTheDocument();
    expect(screen.getByText('Develop software features')).toBeInTheDocument();
    expect(screen.getByText('Skills:')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });
});

// Responsibility Matrix Tests
describe('ResponsibilityMatrix Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders matrix with departments and roles', () => {
    render(
      <Provider store={store}>
        <ResponsibilityMatrix />
      </Provider>
    );
    
    // Check if matrix headers are displayed
    expect(screen.getByText('Responsibility Matrix')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  test('allows filtering by department', () => {
    render(
      <Provider store={store}>
        <ResponsibilityMatrix />
      </Provider>
    );
    
    // Select department filter
    fireEvent.change(screen.getByLabelText('Filter by Department'), { target: { value: 'dept1' } });
    
    // Check if filtered results are displayed
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.queryByText('Marketing')).not.toBeInTheDocument();
  });
});

// Headcount Calculator Tests
describe('HeadcountCalculator Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders calculator form correctly', () => {
    render(
      <Provider store={store}>
        <HeadcountCalculator />
      </Provider>
    );
    
    // Check if calculator form elements are displayed
    expect(screen.getByText('Headcount Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText('Work Orders')).toBeInTheDocument();
    expect(screen.getByLabelText('Handling Time')).toBeInTheDocument();
  });

  test('calculates headcount based on inputs', async () => {
    render(
      <Provider store={store}>
        <HeadcountCalculator />
      </Provider>
    );
    
    // Fill in calculator form
    fireEvent.change(screen.getByLabelText('Work Orders'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Handling Time'), { target: { value: '30' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Calculate Headcount'));
    
    // Check if calculation was performed
    await waitFor(() => {
      expect(screen.getByText('Calculated Headcount:')).toBeInTheDocument();
    });
  });
});

// Organizational Chart Tests
describe('OrganizationalChart Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders organizational chart correctly', () => {
    render(
      <Provider store={store}>
        <OrganizationalChart />
      </Provider>
    );
    
    // Check if chart elements are displayed
    expect(screen.getByText('Organizational Chart')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument();
  });

  test('allows changing chart layout direction', () => {
    render(
      <Provider store={store}>
        <OrganizationalChart />
      </Provider>
    );
    
    // Change layout direction
    fireEvent.click(screen.getByLabelText('Horizontal Layout'));
    
    // Check if layout was changed
    expect(screen.getByLabelText('Horizontal Layout')).toBeChecked();
  });
});

// Gap Analysis Tests
describe('GapAnalysis Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders gap analysis correctly', () => {
    render(
      <Provider store={store}>
        <GapAnalysis />
      </Provider>
    );
    
    // Check if gap analysis elements are displayed
    expect(screen.getByText('Gap Analysis')).toBeInTheDocument();
    expect(screen.getByText('Identify Gaps')).toBeInTheDocument();
  });

  test('identifies headcount gaps', async () => {
    render(
      <Provider store={store}>
        <GapAnalysis />
      </Provider>
    );
    
    // Click identify gaps button
    fireEvent.click(screen.getByText('Identify Gaps'));
    
    // Check if gaps are identified
    await waitFor(() => {
      expect(screen.getByText('Headcount Gaps')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Current: 5, Projected: 8')).toBeInTheDocument();
    });
  });
});

// User Onboarding Tests
describe('UserOnboarding Component', () => {
  test('renders onboarding dialog correctly', () => {
    render(<UserOnboarding />);
    
    // Check if onboarding elements are displayed
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the Organizational Structure Management App')).toBeInTheDocument();
  });

  test('allows navigating through onboarding steps', () => {
    render(<UserOnboarding />);
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check if second step is displayed
    expect(screen.getByText('Department & Role Management')).toBeInTheDocument();
  });

  test('allows skipping onboarding', () => {
    render(<UserOnboarding />);
    
    // Click skip button
    fireEvent.click(screen.getByText('Skip Tour'));
    
    // Check if onboarding is closed
    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument();
  });
});

// Security Implementation Tests
describe('SecurityImplementation Component', () => {
  test('renders security features correctly', () => {
    render(<SecurityImplementation />);
    
    // Check if security elements are displayed
    expect(screen.getByText('Security Implementation')).toBeInTheDocument();
    expect(screen.getByText('Link-Based Security')).toBeInTheDocument();
  });

  test('allows generating share links', () => {
    render(<SecurityImplementation />);
    
    // Click generate links button
    fireEvent.click(screen.getByText('Generate New Links'));
    
    // Check if links are generated
    expect(screen.getByText('Edit Access Link')).toBeInTheDocument();
    expect(screen.getByText('View-Only Link')).toBeInTheDocument();
  });

  test('allows toggling security options', () => {
    render(<SecurityImplementation />);
    
    // Toggle custom URL option
    fireEvent.click(screen.getByLabelText('Custom URL'));
    
    // Check if custom URL field is displayed
    expect(screen.getByLabelText('Custom URL Segment')).toBeInTheDocument();
  });
});

export default {};
