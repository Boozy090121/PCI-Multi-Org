import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
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
  TextField,
  Slider,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Save as SaveIcon,
  Refresh as RefreshIcon,
  SimCardDownload as SimulationIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ScenarioSimulator: React.FC = () => {
  const { items: calculators, selectedCalculatorId } = useSelector((state: RootState) => state.calculators);
  const { items: departments } = useSelector((state: RootState) => state.departments);
  
  // Get the current calculator
  const currentCalculator = calculators.find(c => c.id === selectedCalculatorId);
  
  // Simulation parameters
  const [simulationName, setSimulationName] = useState('');
  const [timeframe, setTimeframe] = useState(12); // months
  const [growthScenarios, setGrowthScenarios] = useState([
    { name: 'Conservative', growthRate: 2, probability: 30 },
    { name: 'Expected', growthRate: 5, probability: 50 },
    { name: 'Aggressive', growthRate: 10, probability: 20 }
  ]);
  const [efficiencyGain, setEfficiencyGain] = useState(0.5); // % per month
  const [seasonalFactors, setSeasonalFactors] = useState([
    { month: 'January', factor: 1.0 },
    { month: 'February', factor: 1.0 },
    { month: 'March', factor: 1.0 },
    { month: 'April', factor: 1.0 },
    { month: 'May', factor: 1.0 },
    { month: 'June', factor: 1.0 },
    { month: 'July', factor: 1.0 },
    { month: 'August', factor: 1.0 },
    { month: 'September', factor: 1.0 },
    { month: 'October', factor: 1.0 },
    { month: 'November', factor: 1.0 },
    { month: 'December', factor: 1.0 }
  ]);
  
  // Handle growth scenario change
  const handleGrowthScenarioChange = (index: number, field: string, value: number) => {
    const updatedScenarios = [...growthScenarios];
    updatedScenarios[index] = { ...updatedScenarios[index], [field]: value };
    
    // Adjust probabilities to sum to 100%
    if (field === 'probability') {
      const totalOthers = updatedScenarios.reduce((sum, scenario, i) => 
        i !== index ? sum + scenario.probability : sum, 0
      );
      
      if (totalOthers + value > 100) {
        const excess = totalOthers + value - 100;
        const factor = totalOthers > 0 ? (totalOthers - excess) / totalOthers : 0;
        
        updatedScenarios.forEach((scenario, i) => {
          if (i !== index) {
            scenario.probability = Math.round(scenario.probability * factor);
          }
        });
      }
    }
    
    setGrowthScenarios(updatedScenarios);
  };
  
  // Handle seasonal factor change
  const handleSeasonalFactorChange = (index: number, value: number) => {
    const updatedFactors = [...seasonalFactors];
    updatedFactors[index] = { ...updatedFactors[index], factor: value };
    setSeasonalFactors(updatedFactors);
  };
  
  // Calculate total probability
  const totalProbability = growthScenarios.reduce((sum, scenario) => sum + scenario.probability, 0);
  
  // Run simulation
  const handleRunSimulation = () => {
    // This would dispatch an action to run the simulation
    console.log('Running simulation with parameters:', {
      simulationName,
      timeframe,
      growthScenarios,
      efficiencyGain,
      seasonalFactors
    });
  };
  
  // Render simulation results
  const renderSimulationResults = () => {
    // This would show the simulation results
    // For now, we'll just show a placeholder
    
    return (
      <Card variant="outlined">
        <CardHeader title="Simulation Results" />
        <CardContent>
          <Typography variant="body1" paragraph>
            Run a simulation to see projected headcount over time.
          </Typography>
          
          {/* Placeholder for simulation chart */}
          <Box 
            sx={{ 
              height: 300, 
              backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Simulation chart will appear here
            </Typography>
          </Box>
          
          {/* Placeholder for simulation table */}
          <Typography variant="h6" gutterBottom>
            Projected Headcount by Month
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Conservative</TableCell>
                  <TableCell align="right">Expected</TableCell>
                  <TableCell align="right">Aggressive</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: timeframe }).map((_, index) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() + index);
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Headcount Scenario Simulator
      </Typography>
      
      <Typography variant="body1" paragraph>
        Create simulations to project headcount needs over time based on different growth scenarios.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Simulation Parameters" />
            <CardContent>
              <TextField
                fullWidth
                label="Simulation Name"
                value={simulationName}
                onChange={(e) => setSimulationName(e.target.value)}
                margin="normal"
              />
              
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>
                  Timeframe: {timeframe} months
                </Typography>
                <Slider
                  value={timeframe}
                  onChange={(e, newValue) => setTimeframe(newValue as number)}
                  min={3}
                  max={36}
                  step={3}
                  marks={[
                    { value: 3, label: '3m' },
                    { value: 12, label: '1yr' },
                    { value: 24, label: '2yr' },
                    { value: 36, label: '3yr' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>
                  Monthly Efficiency Gain: {efficiencyGain}%
                </Typography>
                <Slider
                  value={efficiencyGain}
                  onChange={(e, newValue) => setEfficiencyGain(newValue as number)}
                  min={0}
                  max={2}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Growth Scenarios
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Scenario</TableCell>
                        <TableCell>Growth Rate (%)</TableCell>
                        <TableCell>Probability (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {growthScenarios.map((scenario, index) => (
                        <TableRow key={index}>
                          <TableCell>{scenario.name}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={scenario.growthRate}
                              onChange={(e) => handleGrowthScenarioChange(
                                index, 
                                'growthRate', 
                                Number(e.target.value)
                              )}
                              InputProps={{ inputProps: { min: -10, max: 50 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={scenario.probability}
                              onChange={(e) => handleGrowthScenarioChange(
                                index, 
                                'probability', 
                                Number(e.target.value)
                              )}
                              error={totalProbability !== 100}
                              InputProps={{ inputProps: { min: 0, max: 100 } }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} align="right">
                          <Typography fontWeight="bold">Total:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            fontWeight="bold" 
                            color={totalProbability === 100 ? 'success.main' : 'error.main'}
                          >
                            {totalProbability}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Seasonal Factors
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell>Factor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {seasonalFactors.map((factor, index) => (
                        <TableRow key={index}>
                          <TableCell>{factor.month}</TableCell>
                          <TableCell>
                            <Slider
                              value={factor.factor}
                              onChange={(e, newValue) => handleSeasonalFactorChange(
                                index, 
                                newValue as number
                              )}
                              min={0.5}
                              max={1.5}
                              step={0.05}
                              valueLabelDisplay="auto"
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SimulationIcon />}
                  onClick={handleRunSimulation}
                  disabled={!simulationName || totalProbability !== 100}
                >
                  Run Simulation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {renderSimulationResults()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScenarioSimulator;
