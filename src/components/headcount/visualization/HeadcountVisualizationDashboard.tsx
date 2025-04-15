import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Types for our headcount data
interface HeadcountData {
  department: string;
  current: number;
  projected: number;
  gap: number;
}

interface TrendData {
  month: string;
  headcount: number;
  projection: number;
}

interface BreakdownData {
  name: string;
  value: number;
  color: string;
}

// Sample data - in a real app this would come from props or context
const sampleHeadcountData: HeadcountData[] = [
  { department: 'Engineering', current: 45, projected: 57, gap: 12 },
  { department: 'Product', current: 22, projected: 28, gap: 6 },
  { department: 'Marketing', current: 15, projected: 18, gap: 3 },
  { department: 'Sales', current: 30, projected: 35, gap: 5 },
  { department: 'Customer Success', current: 19, projected: 23, gap: 4 },
  { department: 'Finance', current: 11, projected: 12, gap: 1 },
  { department: 'HR', current: 9, projected: 9, gap: 0 },
  { department: 'Legal', current: 5, projected: 5, gap: 0 }
];

const sampleTrendData: TrendData[] = [
  { month: 'Jan', headcount: 140, projection: 140 },
  { month: 'Feb', headcount: 145, projection: 145 },
  { month: 'Mar', headcount: 148, projection: 148 },
  { month: 'Apr', headcount: 152, projection: 152 },
  { month: 'May', headcount: 156, projection: 156 },
  { month: 'Jun', headcount: 0, projection: 162 },
  { month: 'Jul', headcount: 0, projection: 168 },
  { month: 'Aug', headcount: 0, projection: 174 },
  { month: 'Sep', headcount: 0, projection: 178 },
  { month: 'Oct', headcount: 0, projection: 182 },
  { month: 'Nov', headcount: 0, projection: 185 },
  { month: 'Dec', headcount: 0, projection: 187 }
];

const sampleBreakdownData: BreakdownData[] = [
  { name: 'Engineering', value: 45, color: '#4285F4' },
  { name: 'Product', value: 22, color: '#EA4335' },
  { name: 'Marketing', value: 15, color: '#FBBC05' },
  { name: 'Sales', value: 30, color: '#34A853' },
  { name: 'Customer Success', value: 19, color: '#8F44AD' },
  { name: 'Finance', value: 11, color: '#3498DB' },
  { name: 'HR', value: 9, color: '#E67E22' },
  { name: 'Legal', value: 5, color: '#1ABC9C' }
];

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
        <p className="font-semibold">{label}</p>
        <p className="text-[#4285F4]">Current: {payload[0].value}</p>
        <p className="text-[#34A853]">Projected: {payload[1].value}</p>
        <p className="text-[#EA4335]">Gap: {payload[2].value}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for the pie chart
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
        <p className="font-semibold">{payload[0].name}</p>
        <p>Headcount: {payload[0].value}</p>
        <p>Percentage: {Math.round(payload[0].percent * 100)}%</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for the line chart
const LineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
        <p className="font-semibold">{label}</p>
        {payload[0].value > 0 && (
          <p className="text-[#4285F4]">Actual: {payload[0].value}</p>
        )}
        <p className="text-[#34A853]">Projected: {payload[1].value}</p>
      </div>
    );
  }
  return null;
};

// Main component
const HeadcountVisualizationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'department' | 'trend' | 'breakdown'>('department');
  
  // Calculate totals
  const currentTotal = sampleHeadcountData.reduce((sum, item) => sum + item.current, 0);
  const projectedTotal = sampleHeadcountData.reduce((sum, item) => sum + item.projected, 0);
  const totalGap = projectedTotal - currentTotal;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Headcount Visualization Dashboard</h2>
        <p className="text-gray-600">
          Visual analysis of current and projected headcount across departments
        </p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-gray-600 text-sm font-medium">Current Headcount</h3>
          <p className="text-4xl font-bold text-blue-600">{currentTotal}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-gray-600 text-sm font-medium">Projected Headcount</h3>
          <p className="text-4xl font-bold text-green-600">{projectedTotal}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-gray-600 text-sm font-medium">Headcount Gap</h3>
          <p className="text-4xl font-bold text-red-600">+{totalGap}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'department' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('department')}
        >
          Department Analysis
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'trend' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('trend')}
        >
          Trend Analysis
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'breakdown' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('breakdown')}
        >
          Headcount Breakdown
        </button>
      </div>
      
      {/* Chart area */}
      <div className="h-96">
        {activeTab === 'department' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sampleHeadcountData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="current" name="Current Headcount" fill="#4285F4" />
              <Bar dataKey="projected" name="Projected Headcount" fill="#34A853" />
              <Bar dataKey="gap" name="Headcount Gap" fill="#EA4335" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {activeTab === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sampleTrendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<LineTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="headcount" 
                name="Actual Headcount" 
                stroke="#4285F4" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="projection" 
                name="Projected Headcount" 
                stroke="#34A853" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {activeTab === 'breakdown' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sampleBreakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {sampleBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Additional insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">Key Insights</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Engineering department has the highest projected growth with 12 new positions</li>
          <li>Product and Sales departments show moderate growth needs</li>
          <li>HR and Legal departments have stable headcount projections</li>
          <li>Overall organization growth rate is projected at {Math.round((totalGap / currentTotal) * 100)}%</li>
        </ul>
      </div>
      
      {/* Export options */}
      <div className="mt-6 flex justify-end space-x-2">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Export as CSV
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Export as PDF
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Export as Image
        </button>
      </div>
    </div>
  );
};

export default HeadcountVisualizationDashboard;
