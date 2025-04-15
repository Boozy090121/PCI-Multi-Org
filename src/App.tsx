import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateManagementSystem from './components/departments/TemplateManagementSystem';
import DepartmentManagement from './features/departments/DepartmentManagement';
import RoleManagement from './features/roles/RoleManagement';
import MatrixManagement from './features/matrices/MatrixManagement';
import OrgChartDisplay from './features/orgchart/OrgChartDisplay';
import GapAnalysisOverview from './features/gap-analysis/GapAnalysisOverview';
import StandardResponsibilityManagement from './features/standard-items/StandardResponsibilityManagement';
import StandardSkillManagement from './features/standard-items/StandardSkillManagement';
import { useAuth } from './context/AuthContext';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import LoginDialog from './features/auth/LoginDialog';
import DashboardOverview from './features/dashboard/DashboardOverview';
import ProcessManagement from './features/processes/ProcessManagement';
import SimpleHeadcountCalculator from './features/headcount/SimpleHeadcountCalculator';

const App: React.FC = () => {
  const { currentUser, isLoading: authLoading, requiresSetup } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleLogin = () => {
    setIsLoginDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Organizational Structure Management</h1>
          <p className="text-gray-600 mt-2">Manage your organization's structure, roles, and responsibilities</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {currentUser ? (
            <>
              <div className="flex items-center space-x-2">
                 <span className="text-sm text-gray-700">Welcome, {currentUser.displayName || currentUser.email}!</span>
                 <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Edit Access Enabled</span>
            </>
          ) : (
             <>
              <Button size="sm" onClick={handleLogin}>Login</Button>
               <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Read-Only Mode</span>
             </>
          )}
        </div>
      </header>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="matrices">Matrices</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="orgchart">Org Chart</TabsTrigger>
          <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
          <TabsTrigger value="std-responsibilities">Std Responsibilities</TabsTrigger>
          <TabsTrigger value="std-skills">Std Skills</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        {authLoading ? (
          <div className="flex justify-center items-center h-64"><p>Loading authentication...</p></div>
        ) : !currentUser ? (
          <LoginDialog />
        ) : requiresSetup ? (
          <div className="p-6">TODO: Initial Setup/Org Creation UI</div>
        ) : (
          <>
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <DashboardOverview />
                
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  <p className="text-gray-500">Activity feed coming soon...</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
                   <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                   <div className="flex flex-col space-y-2">
                     <Button variant="outline">Add New Department</Button>
                     <Button variant="outline">Create New Role</Button>
                     <Button variant="outline">Update Headcount</Button>
                     <Button variant="outline">Export Organization Chart</Button>
                   </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Department Overview</h2>
                <p className="text-gray-500">Department summary cards coming soon...</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold mb-4">Implementation Progress</h2>
                 <p className="text-gray-500">Progress bars coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="headcount">
              <SimpleHeadcountCalculator />
            </TabsContent>
            
            <TabsContent value="templates">
              <TemplateManagementSystem />
            </TabsContent>
            
            <TabsContent value="departments">
              <DepartmentManagement />
            </TabsContent>
            
            <TabsContent value="roles">
              <RoleManagement />
            </TabsContent>
            
            <TabsContent value="processes">
              <ProcessManagement />
            </TabsContent>
            
            <TabsContent value="matrices">
              <MatrixManagement />
            </TabsContent>
            
            <TabsContent value="orgchart">
              <OrgChartDisplay />
            </TabsContent>
            
            <TabsContent value="gap-analysis">
              <GapAnalysisOverview />
            </TabsContent>
            
            <TabsContent value="std-responsibilities">
              <StandardResponsibilityManagement />
            </TabsContent>
            
            <TabsContent value="std-skills">
              <StandardSkillManagement />
            </TabsContent>
          </>
        )}
      </Tabs>

      <LoginDialog 
        isOpen={isLoginDialogOpen} 
        onClose={() => setIsLoginDialogOpen(false)} 
      />
    </div>
  );
};

export default App;
