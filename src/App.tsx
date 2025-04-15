import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeadcountVisualizationDashboard from './components/headcount/visualization/HeadcountVisualizationDashboard';
import TemplateManagementSystem from './components/departments/TemplateManagementSystem';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Organizational Structure Management</h1>
        <p className="text-gray-600 mt-2">Manage your organization's structure, roles, and responsibilities</p>
      </header>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="matrices">Matrices</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="orgchart">Org Chart</TabsTrigger>
          <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Organization Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Departments</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Roles</span>
                  <span className="font-medium">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Headcount</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projected Headcount</span>
                  <span className="font-medium text-green-600">187</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <p className="font-medium">New role added: Senior Product Designer</p>
                  <p className="text-sm text-gray-500">Today, 10:23 AM</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-1">
                  <p className="font-medium">Headcount calculation updated</p>
                  <p className="text-sm text-gray-500">Yesterday, 3:45 PM</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-1">
                  <p className="font-medium">RACI matrix updated for Engineering</p>
                  <p className="text-sm text-gray-500">Yesterday, 11:30 AM</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Add New Department
                </button>
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Create New Role
                </button>
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Update Headcount
                </button>
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Export Organization Chart
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Department Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(66, 133, 244, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#4285F4' }}></div>
                <h3 className="font-medium">Engineering</h3>
                <p className="text-sm text-gray-600">12 roles</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(234, 67, 53, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#EA4335' }}></div>
                <h3 className="font-medium">Product</h3>
                <p className="text-sm text-gray-600">8 roles</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(251, 188, 5, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#FBBC05' }}></div>
                <h3 className="font-medium">Marketing</h3>
                <p className="text-sm text-gray-600">6 roles</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(52, 168, 83, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#34A853' }}></div>
                <h3 className="font-medium">Sales</h3>
                <p className="text-sm text-gray-600">5 roles</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(143, 68, 173, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#8F44AD' }}></div>
                <h3 className="font-medium">Customer Success</h3>
                <p className="text-sm text-gray-600">4 roles</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#3498DB' }}></div>
                <h3 className="font-medium">Finance</h3>
                <p className="text-sm text-gray-600">3 roles</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#E67E22' }}></div>
                <h3 className="font-medium">HR</h3>
                <p className="text-sm text-gray-600">2 roles</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(26, 188, 156, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: '#1ABC9C' }}></div>
                <h3 className="font-medium">Legal</h3>
                <p className="text-sm text-gray-600">2 roles</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Implementation Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Department Structure</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Role Definition</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Responsibility Matrix</span>
                  <span className="text-sm font-medium">70%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Headcount Planning</span>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Gap Analysis</span>
                  <span className="text-sm font-medium">40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="headcount">
          <HeadcountVisualizationDashboard />
        </TabsContent>
        
        <TabsContent value="templates">
          <TemplateManagementSystem />
        </TabsContent>
        
        {/* Placeholder content for other tabs */}
        <TabsContent value="departments">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Department Management</h2>
            <p>Department management content would go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="roles">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Role Management</h2>
            <p>Role management content would go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="matrices">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Responsibility Matrices</h2>
            <p>Matrices content would go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="orgchart">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Organizational Chart</h2>
            <p>Org chart content would go here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="gap-analysis">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Gap Analysis</h2>
            <p>Gap analysis content would go here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
