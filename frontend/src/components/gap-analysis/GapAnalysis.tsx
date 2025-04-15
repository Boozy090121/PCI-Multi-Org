import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface GapAnalysisProps {
  onCreateAnalysis: () => void;
  onViewAnalysis: (analysisId: string) => void;
  onEditAnalysis: (analysisId: string) => void;
  onExportAnalysis: (analysisId: string) => void;
}

const GapAnalysis: React.FC<GapAnalysisProps> = ({
  onCreateAnalysis,
  onViewAnalysis,
  onEditAnalysis,
  onExportAnalysis
}) => {
  // In a real implementation, these would be fetched from the Redux store
  const analyses = [
    {
      id: '1',
      name: 'Engineering Department Gap Analysis',
      description: 'Identifies gaps in the Engineering department structure and staffing',
      lastUpdated: '2025-03-17T10:30:00Z',
      departments: ['Engineering'],
      gapTypes: ['Headcount', 'Skills', 'Responsibilities'],
      gapCount: 12,
      severity: 'High',
      progress: 25
    },
    {
      id: '2',
      name: 'Cross-Departmental Responsibility Gaps',
      description: 'Analyzes responsibility gaps across all departments',
      lastUpdated: '2025-03-22T14:45:00Z',
      departments: ['Engineering', 'Product', 'Marketing', 'Sales', 'Customer Success'],
      gapTypes: ['Responsibilities', 'Reporting'],
      gapCount: 8,
      severity: 'Medium',
      progress: 50
    },
    {
      id: '3',
      name: 'Product Team Skills Assessment',
      description: 'Identifies skill gaps in the Product team',
      lastUpdated: '2025-03-10T09:15:00Z',
      departments: ['Product'],
      gapTypes: ['Skills', 'Headcount'],
      gapCount: 5,
      severity: 'Low',
      progress: 75
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Gap Analysis</Typography>
        <Button variant="contained" color="primary" onClick={onCreateAnalysis}>
          Create Analysis
        </Button>
      </Box>

      <Typography variant="body1" paragraph>
        Gap analysis helps identify discrepancies between your current organizational structure and your ideal state,
        highlighting areas that need attention in headcount, skills, responsibilities, and reporting relationships.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {analyses.map((analysis) => (
          <Box key={analysis.id} sx={{ width: { xs: '100%', md: '48%', lg: '31%' } }}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `5px solid ${
                  analysis.severity === 'High' ? '#f44336' :
                  analysis.severity === 'Medium' ? '#ff9800' :
                  '#4caf50'
                }`
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ 
                      mr: 1,
                      color: analysis.severity === 'High' ? '#f44336' :
                             analysis.severity === 'Medium' ? '#ff9800' :
                             '#4caf50'
                    }} />
                    <Typography variant="h6">
                      {analysis.name}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip 
                      label={`${analysis.severity} Severity`} 
                      size="small" 
                      color={
                        analysis.severity === 'High' ? 'error' :
                        analysis.severity === 'Medium' ? 'warning' :
                        'success'
                      }
                      sx={{ mr: 1 }} 
                    />
                    <Typography variant="caption">
                      Last updated: {new Date(analysis.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {analysis.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Departments</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {analysis.departments.map((department, index) => (
                      <Chip key={index} label={department} size="small" />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Gap Types</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {analysis.gapTypes.map((type, index) => (
                      <Chip 
                        key={index} 
                        label={type} 
                        size="small" 
                        variant="outlined" 
                        color={
                          type === 'Headcount' ? 'primary' :
                          type === 'Skills' ? 'secondary' :
                          type === 'Responsibilities' ? 'info' :
                          'default'
                        }
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Progress</Typography>
                  <Box sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: 'rgba(0, 0, 0, 0.1)', 
                    borderRadius: 5,
                    mt: 1
                  }}>
                    <Box sx={{ 
                      width: `${analysis.progress}%`, 
                      height: '100%', 
                      bgcolor: 
                        analysis.progress < 30 ? '#f44336' :
                        analysis.progress < 70 ? '#ff9800' :
                        '#4caf50',
                      borderRadius: 5
                    }} />
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    {analysis.progress}% complete
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onViewAnalysis(analysis.id)}
                    fullWidth
                  >
                    View
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onEditAnalysis(analysis.id)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onExportAnalysis(analysis.id)}
                    fullWidth
                  >
                    Export
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Analysis Types
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comprehensive Gap Analysis
              </Typography>
              <Typography variant="body2" paragraph>
                Analyze all gap types across multiple departments to get a complete picture of your organizational needs.
                Identify patterns and systemic issues that span across the organization.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onCreateAnalysis}
                startIcon={<WarningIcon />}
              >
                Create Comprehensive Analysis
              </Button>
            </Paper>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Focused Gap Analysis
              </Typography>
              <Typography variant="body2" paragraph>
                Focus on a specific department or gap type to dive deep into particular issues.
                Ideal for targeted improvements or addressing specific organizational challenges.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={onCreateAnalysis}
                startIcon={<AssignmentIcon />}
              >
                Create Focused Analysis
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GapAnalysis;
