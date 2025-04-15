import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react'; // Placeholder icon

// Simple placeholder component
const OrgChartDisplay: React.FC = () => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Organizational Chart</CardTitle>
        <CardDescription>Visualize the organizational structure.</CardDescription>
      </CardHeader>
      <CardContent className="h-[60vh] flex flex-col items-center justify-center text-center">
        <Construction className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
            Organizational Chart visualization is under construction.
        </p>
         <p className="text-sm text-muted-foreground mt-2">
            (Dependencies causing build issues - will revisit later)
         </p>
      </CardContent>
    </Card>
  );
};

export default OrgChartDisplay; 