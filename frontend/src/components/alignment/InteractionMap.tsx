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
  Chip,
  Grid
} from '@mui/material';
import {
  Compare as CompareIcon,
  Share as ShareIcon,
  People as PeopleIcon
} from '@mui/icons-material';

interface InteractionMapProps {
  onCreateMap: () => void;
  onEditMap: (mapId: string) => void;
  onViewMap: (mapId: string) => void;
  onExportMap: (mapId: string) => void;
}

const InteractionMap: React.FC<InteractionMapProps> = ({
  onCreateMap,
  onEditMap,
  onViewMap,
  onExportMap
}) => {
  // In a real implementation, these would be fetched from the Redux store
  const maps = [
    {
      id: '1',
      name: 'Cross-Functional Interactions',
      description: 'Maps interactions between all departments',
      lastUpdated: '2025-03-18T11:30:00Z',
      departments: ['Engineering', 'Product', 'Marketing', 'Sales', 'Customer Success'],
      interactionTypes: ['Collaboration', 'Approval', 'Reporting', 'Information Sharing']
    },
    {
      id: '2',
      name: 'Product Development Flow',
      description: 'Maps interactions in the product development process',
      lastUpdated: '2025-03-22T09:45:00Z',
      departments: ['Engineering', 'Product', 'Design', 'QA', 'Marketing'],
      interactionTypes: ['Handoff', 'Review', 'Collaboration', 'Approval']
    },
    {
      id: '3',
      name: 'Customer Journey Touchpoints',
      description: 'Maps department interactions throughout the customer journey',
      lastUpdated: '2025-03-12T14:15:00Z',
      departments: ['Sales', 'Marketing', 'Customer Success', 'Support', 'Product'],
      interactionTypes: ['Handoff', 'Collaboration', 'Information Sharing']
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Interaction Maps</Typography>
        <Button variant="contained" color="primary" onClick={onCreateMap}>
          Create Map
        </Button>
      </Box>

      <Typography variant="body1" paragraph>
        Interaction maps visualize how different departments and roles interact with each other,
        highlighting communication flows, reporting relationships, and collaboration points.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {maps.map((map) => (
          <Box key={map.id} sx={{ width: { xs: '100%', md: '48%', lg: '31%' } }}>
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
                    <PeopleIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {map.name}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Typography variant="caption">
                    Last updated: {new Date(map.lastUpdated).toLocaleDateString()}
                  </Typography>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {map.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Departments</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {map.departments.map((department, index) => (
                      <Chip key={index} label={department} size="small" />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Interaction Types</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {map.interactionTypes.map((type, index) => (
                      <Chip 
                        key={index} 
                        label={type} 
                        size="small" 
                        variant="outlined" 
                        color={
                          type === 'Approval' ? 'secondary' :
                          type === 'Reporting' ? 'error' :
                          type === 'Collaboration' ? 'success' :
                          type === 'Handoff' ? 'warning' : 'default'
                        }
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onViewMap(map.id)}
                    fullWidth
                  >
                    View
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onEditMap(map.id)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onExportMap(map.id)}
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
          Map Features
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Interaction Visualization
              </Typography>
              <Typography variant="body2" paragraph>
                Visualize interactions between departments and roles with customizable connection types.
                Identify communication channels, reporting relationships, and collaboration points.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onCreateMap}
                startIcon={<CompareIcon />}
              >
                Create Interaction Map
              </Button>
            </Paper>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Process Flow Mapping
              </Typography>
              <Typography variant="body2" paragraph>
                Map how work flows between departments and roles in specific processes.
                Identify handoffs, bottlenecks, and opportunities for process improvement.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={onCreateMap}
                startIcon={<ShareIcon />}
              >
                Create Process Flow
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InteractionMap;
