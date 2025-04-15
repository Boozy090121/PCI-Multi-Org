import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileWarning, CalculatorIcon } from 'lucide-react';

// --- Types --- 
interface RoleWithCalcData {
  id: string;
  title: string;
  handlesComplaints?: boolean;
  complaintsPerFTE?: number | null;
  hoursPerWorkOrder?: number | null;
  // Add department if needed for manager calculation/grouping later
  department?: string; 
}

interface CalculationInputs {
  workOrders: number;
  complaints: number;
  timePeriod: 'week' | 'month';
  hoursPerFTE: number;
  managerSpan: number;
}

interface RoleFTEResult {
  roleId: string;
  roleTitle: string;
  fteNeeded: number;
}

interface CalculationResult {
  totalDirectFTE: number;
  totalManagerFTE: number;
  totalFTE: number;
  fteBreakdown: RoleFTEResult[];
}

// --- Component --- 
const SimpleHeadcountCalculator: React.FC = () => {
  // State for inputs
  const [inputs, setInputs] = useState<CalculationInputs>({
    workOrders: 1000,
    complaints: 500,
    timePeriod: 'month',
    hoursPerFTE: 160, // Assuming 40 hrs/week * 4 weeks
    managerSpan: 8,
  });
  
  // State for data and results
  const [roles, setRoles] = useState<RoleWithCalcData[]>([]);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false); // Separate calculating state

  // Fetch roles data
  useEffect(() => {
    const fetchRolesData = async () => {
      setIsLoadingRoles(true);
      setErrorRoles(null);
      try {
        const rolesQuery = query(collection(db, "roles"), orderBy("title"));
        const rolesSnapshot = await getDocs(rolesQuery);
        const fetchedRoles = rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'Unknown Role',
          handlesComplaints: doc.data().handlesComplaints ?? false,
          complaintsPerFTE: doc.data().complaintsPerFTE ?? null,
          hoursPerWorkOrder: doc.data().hoursPerWorkOrder ?? null,
          department: doc.data().department, // Include department
        })) as RoleWithCalcData[];
        setRoles(fetchedRoles);
      } catch (err) {
        console.error("Error fetching roles for calculator:", err);
        setErrorRoles("Failed to load role data necessary for calculation.");
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchRolesData();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
  };

  const handleSelectChange = (name: keyof CalculationInputs, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // --- Calculation Logic --- 
  const handleCalculate = () => {
    setIsCalculating(true);
    setCalculationResult(null); // Clear previous results

    try {
      // Normalize inputs to monthly
      const monthlyWorkOrders = inputs.timePeriod === 'week' ? inputs.workOrders * 4.33 : inputs.workOrders;
      const monthlyComplaints = inputs.timePeriod === 'week' ? inputs.complaints * 4.33 : inputs.complaints;

      let calculatedDirectFTE = 0;
      const fteBreakdown: RoleFTEResult[] = [];

      roles.forEach(role => {
        let fteForRole = 0;
        if (role.handlesComplaints) {
          // Calculate FTE based on complaints handled
          if (role.complaintsPerFTE && role.complaintsPerFTE > 0 && monthlyComplaints > 0) {
            fteForRole = monthlyComplaints / role.complaintsPerFTE;
          }
        } else {
          // Calculate FTE based on hours per work order
          if (role.hoursPerWorkOrder && role.hoursPerWorkOrder > 0 && monthlyWorkOrders > 0 && inputs.hoursPerFTE > 0) {
             const totalHoursNeeded = monthlyWorkOrders * role.hoursPerWorkOrder;
             fteForRole = totalHoursNeeded / inputs.hoursPerFTE;
          }
        }

        if (fteForRole > 0) {
            calculatedDirectFTE += fteForRole;
            fteBreakdown.push({
                roleId: role.id,
                roleTitle: role.title,
                fteNeeded: parseFloat(fteForRole.toFixed(2)) // Round to 2 decimal places
            });
        }
      });

      // Calculate Manager FTE (simple span of control)
      const calculatedManagerFTE = inputs.managerSpan > 0 ? Math.ceil(calculatedDirectFTE / inputs.managerSpan) : 0;
      const totalFTE = calculatedDirectFTE + calculatedManagerFTE;

      setCalculationResult({
        totalDirectFTE: parseFloat(calculatedDirectFTE.toFixed(2)),
        totalManagerFTE: calculatedManagerFTE,
        totalFTE: parseFloat(totalFTE.toFixed(2)),
        fteBreakdown: fteBreakdown.sort((a, b) => b.fteNeeded - a.fteNeeded) // Sort by FTE needed
      });

    } catch (err) {
        console.error("Error during calculation:", err);
        setErrorRoles("An error occurred during calculation."); // Use role error state for calc errors too?
    } finally {
        setIsCalculating(false);
    }
  };

  // --- Render Logic --- 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Card */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Headcount Calculator Inputs</CardTitle>
          <CardDescription>Enter workload metrics and parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="workOrders">Work Orders</Label>
              <Input id="workOrders" name="workOrders" type="number" value={inputs.workOrders} onChange={handleInputChange} placeholder="e.g., 1000" />
            </div>
             <div className="space-y-1">
              <Label htmlFor="complaints">Complaints</Label>
              <Input id="complaints" name="complaints" type="number" value={inputs.complaints} onChange={handleInputChange} placeholder="e.g., 500" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="timePeriod">Time Period</Label>
            <Select name="timePeriod" value={inputs.timePeriod} onValueChange={(value) => handleSelectChange('timePeriod', value)}>
              <SelectTrigger id="timePeriod">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Per Week</SelectItem>
                <SelectItem value="month">Per Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
             <Label htmlFor="hoursPerFTE">Productive Hours / FTE / Month</Label>
             <Input id="hoursPerFTE" name="hoursPerFTE" type="number" value={inputs.hoursPerFTE} onChange={handleInputChange} placeholder="e.g., 160" />
          </div>
           <div className="space-y-1">
             <Label htmlFor="managerSpan">Manager Span of Control</Label>
             <Input id="managerSpan" name="managerSpan" type="number" value={inputs.managerSpan} onChange={handleInputChange} placeholder="e.g., 8" />
             <p className="text-xs text-muted-foreground">Avg. direct reports per manager.</p>
          </div>
          <Button onClick={handleCalculate} disabled={isLoadingRoles || isCalculating} className="w-full">
            {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalculatorIcon className="mr-2 h-4 w-4" />}
            Calculate Headcount
          </Button>
           {errorRoles && <p className="text-sm text-destructive text-center pt-2">{errorRoles}</p>}
           {isLoadingRoles && <p className="text-sm text-muted-foreground text-center pt-2">Loading role data...</p>}
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
           <CardDescription>Recommended FTE based on inputs.</CardDescription>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
             <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : !calculationResult ? (
             <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-md">
                <CalculatorIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Enter inputs and click 'Calculate Headcount' to see results.</p>
             </div>
          ) : (
             <div className="space-y-6">
               {/* Summary Totals */}
               <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                     <p className="text-xs text-muted-foreground uppercase">Direct FTE</p>
                     <p className="text-2xl font-bold">{calculationResult.totalDirectFTE}</p>
                  </div>
                  <div>
                     <p className="text-xs text-muted-foreground uppercase">Manager FTE</p>
                     <p className="text-2xl font-bold">{calculationResult.totalManagerFTE}</p>
                  </div>
                  <div>
                     <p className="text-xs text-muted-foreground uppercase">Total FTE</p>
                     <p className="text-2xl font-bold text-blue-600">{calculationResult.totalFTE}</p>
                  </div>
               </div>

               {/* Breakdown Table */}
               <div>
                  <h4 className="font-semibold mb-2">FTE Breakdown by Role</h4>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Role Title</TableHead>
                           <TableHead className="text-right">Calculated FTE</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {calculationResult.fteBreakdown.length === 0 ? (
                           <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">No specific role FTE calculated.</TableCell></TableRow>
                        ) : (
                           calculationResult.fteBreakdown.map(item => (
                              <TableRow key={item.roleId}>
                                 <TableCell>{item.roleTitle}</TableCell>
                                 <TableCell className="text-right font-medium">{item.fteNeeded}</TableCell>
                              </TableRow>
                           ))
                        )}
                     </TableBody>
                  </Table>
               </div>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleHeadcountCalculator; 