import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Construction } from 'lucide-react'; // No longer needed
import OrgChart from '@/components/orgchart/OrgChart'; // Import the actual chart component

// Simple placeholder component
const OrgChartDisplay: React.FC = () => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Organizational Chart</CardTitle>
        <CardDescription>Visualize the organizational structure.</CardDescription>
      </CardHeader>
      <CardContent className="p-0" style={{ height: 'calc(100vh - 200px)' }}> {/* Adjust height as needed, remove padding */}
         {/* Render the actual OrgChart component */}
         <OrgChart />
      </CardContent>
    </Card>
  );
};

export default OrgChartDisplay; 