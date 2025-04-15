import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  GridOn as GridOnIcon,
  Compare as CompareIcon
} from '@mui/icons-material';

interface ResponsibilityMatrixProps {
  onCreateMatrix: () => void;
  onEditMatrix: (matrixId: string) => void;
  onViewMatrix: (matrixId: string) => void;
  onExportMatrix: (matrixId: string) => void;
}

const ResponsibilityMatrix: React.FC<ResponsibilityMatrixProps> = ({
  onCreateMatrix,
  onEditMatrix,
  onViewMatrix,
  onExportMatrix
}) => {
  // In a real implementation, these would be fetched from the Redux store
  const matrices = [
    {
      id: '1',
      name: 'Core Responsibilities Matrix',
      type: 'Standard',
      description: 'Maps core responsibilities across all departments',
      lastUpdated: '2025-03-15T10:30:00Z',
      departments: ['Engineering', 'Product', 'Marketing', 'Sales'],
      responsibilityCount: 24
    },
    {
      id: '2',
      name: 'Product Development RACI',
      type: 'RACI',
      description: 'RACI chart for product development process',
      lastUpdated: '2025-03-20T14:45:00Z',
      departments: ['Engineering', 'Product', 'Design', 'QA'],
      responsibilityCount: 18
    },
    {
      id: '3',
      name: 'Customer Support Matrix',
      type: 'Standard',
      description: 'Maps customer support responsibilities',
      lastUpdated: '2025-03-10T09:15:00Z',
      departments: ['Customer Success', 'Support', 'Engineering', 'Product'],
      responsibilityCount: 15
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Responsibility Matrices</Typography>
        <Button variant="contained" color="primary" onClick={onCreateMatrix}>
          Create Matrix
        </Button>
      </Box>

      <Typography variant="body1" paragraph>
        Responsibility matrices help visualize how responsibilities are distributed across departments and roles,
        highlighting overlaps and gaps in your organizational structure.
      </Typography>

      <Grid container spacing={3}>
        {matrices.map((matrix) => (
          <Grid item xs={12} md={6} lg={4} key={matrix.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {matrix.type === 'RACI' ? (
                      <GridOnIcon sx={{ mr: 1 }} />
                    ) : (
                      <AssessmentIcon sx={{ mr: 1 }} />
                    )}
                    <Typography variant="h6">
                      {matrix.name}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip 
                      label={matrix.type} 
                      size="small" 
                      color={matrix.type === 'RACI' ? 'secondary' : 'primary'} 
                      sx={{ mr: 1 }} 
                    />
                    <Typography variant="caption">
                      Last updated: {new Date(matrix.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {matrix.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Departments</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {matrix.departments.map((department, index) => (
                      <Chip key={index} label={department} size="small" />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Coverage</Typography>
                  <Typography variant="body2">
                    {matrix.responsibilityCount} responsibilities mapped across {matrix.departments.length} departments
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onViewMatrix(matrix.id)}
                    fullWidth
                  >
                    View
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onEditMatrix(matrix.id)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onExportMatrix(matrix.id)}
                    fullWidth
                  >
                    Export
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Matrix Types
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Standard Responsibility Matrix
              </Typography>
              <Typography variant="body2" paragraph>
                Maps responsibilities to departments and roles, showing who is responsible for what.
                Helps identify overlaps and gaps in responsibilities across the organization.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onCreateMatrix}
                startIcon={<AssessmentIcon />}
              >
                Create Standard Matrix
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                RACI Chart
              </Typography>
              <Typography variant="body2" paragraph>
                Defines who is Responsible, Accountable, Consulted, and Informed for each responsibility.
                Clarifies decision-making authority and involvement levels.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={onCreateMatrix}
                startIcon={<GridOnIcon />}
              >
                Create RACI Chart
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ResponsibilityMatrix;
