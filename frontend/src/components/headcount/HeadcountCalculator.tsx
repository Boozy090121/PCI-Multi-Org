import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  Slider, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Save as SaveIcon,
  Refresh as RefreshIcon,
  BarChart as ChartIcon,
  SimCardDownload as SimulationIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchCalculators, 
  addCalculator, 
  editCalculator, 
  removeCalculator, 
  selectCalculator,
  executeSimulation
} from '../../store/slices/calculatorsSlice';
import { openModal, closeModal, addNotification } from '../../store/slices/uiSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  PieController,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  PieController,
  ArcElement
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`calculator-tabpanel-${index}`}
      aria-labelledby={`calculator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HeadcountCalculator: React.FC = () => {
  const dispatch = useDispatch();
  const { items: calculators, status, error, selectedCalculatorId, currentScenarioId } = useSelector((state: RootState) => state.calculators);
  const { items: departments } = useSelector((state: RootState) => state.departments);
  const { isOpen: isModalOpen, type: modalType } = useSelector((state: RootState) => state.ui.modal);
  
  const [tabValue, setTabValue] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Input values for calculator
  const [workOrdersPerDay, setWorkOrdersPerDay] = useState(100);
  const [avgHandlingTime, setAvgHandlingTime] = useState(15);
  const [complaintVolume, setComplaintVolume] = useState(20);
  const [complexityFactor, setComplexityFactor] = useState(1.2);
  const [growthRate, setGrowthRate] = useState(5);
  const [efficiencyFactor, setEfficiencyFactor] = useState(0.9);
  const [absencePercentage, setAbsencePercentage] = useState(8);
  const [trainingTime, setTrainingTime] = useState(10);
  const [regulatoryOverhead, setRegulatoryOverhead] = useState(5);
  
  // Get the current calculator
  const currentCalculator = calculators.find(c => c.id === selectedCalculatorId);
  
  // Get the current scenario
  const currentScenario = currentCalculator?.scenarios.find(s => s.id === currentScenarioId);
  
  // Load calculators on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCalculators());
    }
  }, [status, dispatch]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle calculator selection
  const handleSelectCalculator = (calculatorId: string) => {
    dispatch(selectCalculator(calculatorId));
    
    // Load calculator inputs
    const calculator = calculators.find(c => c.id === calculatorId);
    if (calculator) {
      setWorkOrdersPerDay(calculator.inputs.workOrdersPerDay);
      setAvgHandlingTime(calculator.inputs.avgHandlingTime);
      setComplaintVolume(calculator.inputs.complaintVolume);
      setComplexityFactor(calculator.inputs.complexityFactor);
      setGrowthRate(calculator.inputs.growthRate);
      setEfficiencyFactor(calculator.inputs.efficiencyFactor);
      setAbsencePercentage(calculator.inputs.absencePercentage);
      setTrainingTime(calculator.inputs.trainingTime);
      setRegulatoryOverhead(calculator.inputs.regulatoryOverhead);
    }
  };
  
  // Handle adding a new calculator
  const handleAddCalculator = () => {
    dispatch(openModal({ type: 'add-calculator' }));
  };
  
  // Handle editing a calculator
  const handleEditCalculator = (calculatorId: string) => {
    dispatch(selectCalculator(calculatorId));
    dispatch(openModal({ type: 'edit-calculator' }));
  };
  
  // Handle deleting a calculator
  const handleDeleteCalculator = (calculatorId: string) => {
    dispatch(removeCalculator(calculatorId))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          message: 'Calculator deleted successfully'
        }));
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          message: `Failed to delete calculator: ${error.message}`
        }));
      });
  };
  
  // Handle running the calculation
  const handleRunCalculation = () => {
    if (!selectedCalculatorId) return;
    
    setIsCalculating(true);
    
    const inputs = {
      workOrdersPerDay,
      avgHandlingTime,
      complaintVolume,
      complexityFactor,
      growthRate,
      efficiencyFactor,
      absencePercentage,
      trainingTime,
      regulatoryOverhead
    };
    
    dispatch(executeSimulation({ id: selectedCalculatorId, inputs }))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          message: 'Calculation completed successfully'
        }));
        setIsCalculating(false);
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          message: `Calculation failed: ${error.message}`
        }));
        setIsCalculating(false);
      });
  };
  
  // Handle saving the current inputs
  const handleSaveInputs = () => {
    if (!selectedCalculatorId) return;
    
    const inputs = {
      workOrdersPerDay,
      avgHandlingTime,
      complaintVolume,
      complexityFactor,
      growthRate,
      efficiencyFactor,
      absencePercentage,
      trainingTime,
      regulatoryOverhead
    };
    
    dispatch(editCalculator({ 
      id: selectedCalculatorId, 
      data: { inputs } 
    }))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          message: 'Calculator inputs saved successfully'
        }));
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          message: `Failed to save inputs: ${error.message}`
        }));
      });
  };
  
  // Get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };
  
  // Render calculator inputs
  const renderCalculatorInputs = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Workload Parameters" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography gutterBottom>Work Orders Per Day: {workOrdersPerDay}</Typography>
                  <Slider
                    value={workOrdersPerDay}
                    onChange={(e, newValue) => setWorkOrdersPerDay(newValue as number)}
                    min={0}
                    max={500}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Average Handling Time (minutes): {avgHandlingTime}</Typography>
                  <Slider
                    value={avgHandlingTime}
                    onChange={(e, newValue) => setAvgHandlingTime(newValue as number)}
                    min={1}
                    max={60}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Complaint Volume (per day): {complaintVolume}</Typography>
                  <Slider
                    value={complaintVolume}
                    onChange={(e, newValue) => setComplaintVolume(newValue as number)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Complexity Factor: {complexityFactor.toFixed(1)}</Typography>
                  <Slider
                    value={complexityFactor}
                    onChange={(e, newValue) => setComplexityFactor(newValue as number)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Organizational Factors" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography gutterBottom>Growth Rate (%): {growthRate}</Typography>
                  <Slider
                    value={growthRate}
                    onChange={(e, newValue) => setGrowthRate(newValue as number)}
                    min={-10}
                    max={30}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Efficiency Factor: {efficiencyFactor.toFixed(1)}</Typography>
                  <Slider
                    value={efficiencyFactor}
                    onChange={(e, newValue) => setEfficiencyFactor(newValue as number)}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Absence Percentage (%): {absencePercentage}</Typography>
                  <Slider
                    value={absencePercentage}
                    onChange={(e, newValue) => setAbsencePercentage(newValue as number)}
                    min={0}
                    max={20}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Training Time (days/year): {trainingTime}</Typography>
                  <Slider
                    value={trainingTime}
                    onChange={(e, newValue) => setTrainingTime(newValue as number)}
                    min={0}
                    max={30}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Regulatory Overhead (%): {regulatoryOverhead}</Typography>
                  <Slider
                    value={regulatoryOverhead}
                    onChange={(e, newValue) => setRegulatoryOverhead(newValue as number)}
                    min={0}
                    max={20}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveInputs}
              sx={{ mr: 1 }}
            >
              Save Inputs
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={isCalculating ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              onClick={handleRunCalculation}
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Run Calculation'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    );
  };
  
  // Render calculation results
  const renderCalculationResults = () => {
    if (!currentCalculator || !currentCalculator.results) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No calculation results available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Run a calculation to see results
          </Typography>
        </Box>
      );
    }
    
    // Prepare chart data for department breakdown
    const departmentLabels = currentCalculator.results.departmentBreakdown.map(
      dept => getDepartmentName(dept.departmentId)
    );
    
    const departmentData = currentCalculator.results.departmentBreakdown.map(
      dept => dept.headcount
    );
    
    const departmentColors = currentCalculator.results.departmentBreakdown.map(dept => {
      const department = departments.find(d => d.id === dept.departmentId);
      return department ? department.color : '#cccccc';
    });
    
    const barChartData = {
      labels: departmentLabels,
      datasets: [
        {
          label: 'Headcount',
          data: departmentData,
          backgroundColor: departmentColors,
          borderColor: departmentColors.map(color => color),
          borderWidth: 1,
        },
      ],
    };
    
    const pieChartData = {
      labels: departmentLabels,
      datasets: [
        {
          data: departmentData,
          backgroundColor: departmentColors,
          borderColor: '#ffffff',
          borderWidth: 1,
        },
      ],
    };
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader 
              title="Calculation Results" 
              subheader={`Last calculated: ${new Date(currentCalculator.results.timestamp).toLocaleString()}`} 
            />
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h3" color="primary">
                  {currentCalculator.results.recommendedHeadcount}
                </Typography>
                <Typography variant="subtitle1">
                  Recommended Total Headcount
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Department Breakdown
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="right">Headcount</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentCalculator.results.departmentBreakdown.map((dept) => (
                      <TableRow key={dept.departmentId}>
                        <TableCell>{getDepartmentName(dept.departmentId)}</TableCell>
                        <TableCell align="right">{dept.headcount}</TableCell>
                        <TableCell align="right">
                          {((dept.headcount / currentCalculator.results.recommendedHeadcount) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {currentCalculator.results.recommendedHeadcount}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        100%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom align="center">
                    Department Distribution (Bar Chart)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar 
                      data={barChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }} 
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom align="center">
                    Department Distribution (Pie Chart)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Pie 
                      data={pieChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }} 
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render scenarios comparison
  const renderScenariosComparison = () => {
    if (!currentCalculator || currentCalculator.scenarios.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No scenarios available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Run calculations with different inputs to create scenarios
          </Typography>
        </Box>
      );
    }
    
    // Prepare chart data for scenarios comparison
    const scenarioLabels = currentCalculator.scenarios.map(
      scenario => scenario.name || `Scenario ${new Date(scenario.timestamp).toLocaleDateString()}`
    );
    
    const scenarioData = currentCalculator.scenarios.map(
      scenario => scenario.results.recommendedHeadcount
    );
    
    const barChartData = {
      labels: scenarioLabels,
      datasets: [
        {
          label: 'Headcount',
          data: scenarioData,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader title="Scenarios Comparison" />
            <CardContent>
              <Box sx={{ height: 300, mb: 3 }}>
                <Bar 
                  data={barChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Scenario Details
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Scenario</TableCell>
                      <TableCell align="right">Headcount</TableCell>
                      <TableCell>Key Parameters</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentCalculator.scenarios.map((scenario) => (
                      <TableRow key={scenario.id}>
                        <TableCell>{scenario.name || `Scenario ${new Date(scenario.timestamp).toLocaleDateString()}`}</TableCell>
                        <TableCell align="right">{scenario.results.recommendedHeadcount}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            Work Orders: {scenario.inputs.workOrdersPerDay}
                          </Typography>
                          <Typography variant="body2">
                            Growth: {scenario.inputs.growthRate}%
                          </Typography>
                          <Typography variant="body2">
                            Efficiency: {scenario.inputs.efficiencyFactor.toFixed(1)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(scenario.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Headcount Calculator
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCalculator}
        >
          New Calculator
        </Button>
      </Box>

      {status === 'loading' && (
        <Typography>Loading calculators...</Typography>
      )}

      {status === 'failed' && (
        <Typography color="error">Error: {error}</Typography>
      )}

      {status === 'succeeded' && (
        <>
          {calculators.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
              No calculators found. Create your first calculator to get started.
            </Typography>
          ) : (
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="calculator-select-label">Select Calculator</InputLabel>
                <Select
                  labelId="calculator-select-label"
                  id="calculator-select"
                  value={selectedCalculatorId || ''}
                  label="Select Calculator"
                  onChange={(e) => handleSelectCalculator(e.target.value)}
                >
                  {calculators.map((calculator) => (
                    <MenuItem key={calculator.id} value={calculator.id}>
                      {calculator.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedCalculatorId && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditCalculator(selectedCalculatorId)}
                    sx={{ mr: 1 }}
                  >
                    Edit Calculator
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteCalculator(selectedCalculatorId)}
                  >
                    Delete Calculator
                  </Button>
                </Box>
              )}
              
              {selectedCalculatorId && (
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="calculator tabs">
                      <Tab label="Inputs" id="calculator-tab-0" aria-controls="calculator-tabpanel-0" />
                      <Tab label="Results" id="calculator-tab-1" aria-controls="calculator-tabpanel-1" />
                      <Tab label="Scenarios" id="calculator-tab-2" aria-controls="calculator-tabpanel-2" />
                    </Tabs>
                  </Box>
                  <TabPanel value={tabValue} index={0}>
                    {renderCalculatorInputs()}
                  </TabPanel>
                  <TabPanel value={tabValue} index={1}>
                    {renderCalculationResults()}
                  </TabPanel>
                  <TabPanel value={tabValue} index={2}>
                    {renderScenariosComparison()}
                  </TabPanel>
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default HeadcountCalculator;
