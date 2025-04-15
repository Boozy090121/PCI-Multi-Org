import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// Updated type for actual department data
interface DepartmentData {
  id: string;
  name: string;
  roleCount: number;
}

// Simplified Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
        <p className="font-semibold">{label}</p>
        <p className="text-[#4285F4]">Current: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// Main component
const HeadcountVisualizationDashboard: React.FC = () => {
  const [departmentsData, setDepartmentsData] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments data from Firestore
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      setError(null);
      const departmentsCollectionRef = collection(db, "departments");
      const q = query(departmentsCollectionRef, orderBy("name"));

      try {
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<DepartmentData, 'id'>),
        })) as DepartmentData[];
        // Ensure roleCount is a number, default to 0 if missing/not a number
        fetchedData.forEach(dept => {
          dept.roleCount = Number(dept.roleCount) || 0;
        });
        setDepartmentsData(fetchedData);
      } catch (err) {
        console.error("Error fetching departments data:", err);
        setError("Failed to load department data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []); // Fetch only on component mount

  // Calculate total current headcount from fetched data
  const currentTotal = departmentsData.reduce((sum, item) => sum + item.roleCount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 bg-white rounded-lg shadow-md">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Headcount Dashboard</h2>
        <p className="text-gray-600">
          Current headcount across departments
        </p>
      </div>
      
      {/* Simplified Summary card */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-gray-600 text-sm font-medium">Current Headcount</h3>
          <p className="text-4xl font-bold text-blue-600">{currentTotal}</p>
        </div>
      </div>
      
      {/* Chart area - Only Department Analysis */}
      <div className="h-96">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Headcount by Department</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={departmentsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="roleCount" name="Current Headcount" fill="#4285F4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HeadcountVisualizationDashboard;
