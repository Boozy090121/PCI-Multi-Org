import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface DashboardStats {
  departmentCount: number;
  roleCount: number;
  currentHeadcount: number;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const departmentsQuery = collection(db, 'departments');
        const rolesQuery = collection(db, 'roles');

        const [departmentsSnapshot, rolesSnapshot] = await Promise.all([
          getDocs(departmentsQuery),
          getDocs(rolesQuery),
        ]);

        const departmentCount = departmentsSnapshot.size;
        const roleCount = rolesSnapshot.size;
        
        let currentHeadcount = 0;
        departmentsSnapshot.forEach(doc => {
          const data = doc.data();
          currentHeadcount += Number(data.roleCount) || 0;
        });

        setStats({
          departmentCount,
          roleCount,
          currentHeadcount,
        });

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard overview data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[150px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading Overview...
      </div>
    );
  }

  if (error || !stats) {
    return (
       <div className="bg-white p-6 rounded-lg shadow-md min-h-[150px]">
         <h2 className="text-xl font-semibold mb-4">Organization Overview</h2>
         <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md">
           {error || 'Could not load stats.'}
         </div>
       </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Organization Overview</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Departments</span>
          <span className="font-medium">{stats.departmentCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Roles</span>
          <span className="font-medium">{stats.roleCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Headcount</span>
          <span className="font-medium">{stats.currentHeadcount}</span>
        </div>
        {/* Projected Headcount removed */}
      </div>
    </div>
  );
};

export default DashboardOverview; 