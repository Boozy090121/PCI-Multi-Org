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
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon
} from '@mui/icons-material';

interface DepartmentTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
}

const DepartmentTemplates: React.FC<DepartmentTemplatesProps> = ({ onSelectTemplate }) => {
  // In a real implementation, these would be fetched from the backend
  const templates = [
    {
      id: 'executive',
      name: 'Executive Leadership',
      description: 'Core leadership team responsible for strategic direction and company oversight',
      color: '#4A148C',
      roles: ['CEO', 'CFO', 'CTO', 'COO', 'CMO'],
      responsibilities: ['Strategic planning', 'Company oversight', 'Investor relations']
    },
    {
      id: 'hr',
      name: 'Human Resources',
      description: 'Responsible for recruitment, employee relations, and organizational development',
      color: '#1A237E',
      roles: ['HR Director', 'Recruitment Manager', 'HR Specialist', 'Training Coordinator'],
      responsibilities: ['Recruitment', 'Employee relations', 'Training and development', 'Compensation and benefits']
    },
    {
      id: 'engineering',
      name: 'Engineering',
      description: 'Responsible for product development, technical architecture, and quality assurance',
      color: '#01579B',
      roles: ['Engineering Director', 'Technical Lead', 'Senior Engineer', 'Software Engineer', 'QA Engineer'],
      responsibilities: ['Product development', 'Technical architecture', 'Quality assurance', 'Technical documentation']
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Responsible for brand management, marketing campaigns, and customer acquisition',
      color: '#004D40',
      roles: ['Marketing Director', 'Brand Manager', 'Content Strategist', 'Digital Marketing Specialist'],
      responsibilities: ['Brand management', 'Marketing campaigns', 'Content creation', 'Market research']
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Responsible for financial planning, accounting, and compliance',
      color: '#BF360C',
      roles: ['Finance Director', 'Controller', 'Financial Analyst', 'Accountant'],
      responsibilities: ['Financial planning', 'Accounting', 'Compliance', 'Financial reporting']
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Responsible for day-to-day operations, logistics, and process optimization',
      color: '#33691E',
      roles: ['Operations Director', 'Operations Manager', 'Process Analyst', 'Logistics Coordinator'],
      responsibilities: ['Process optimization', 'Logistics', 'Vendor management', 'Facilities management']
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Responsible for product strategy, roadmap, and user experience',
      color: '#311B92',
      roles: ['Product Director', 'Product Manager', 'UX Designer', 'Product Analyst'],
      responsibilities: ['Product strategy', 'Roadmap planning', 'User experience', 'Market requirements']
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Responsible for revenue generation, client relationships, and business development',
      color: '#1B5E20',
      roles: ['Sales Director', 'Account Executive', 'Sales Representative', 'Business Development Manager'],
      responsibilities: ['Revenue generation', 'Client relationships', 'Business development', 'Sales strategy']
    },
    {
      id: 'customer-success',
      name: 'Customer Success',
      description: 'Responsible for customer satisfaction, retention, and support',
      color: '#0D47A1',
      roles: ['Customer Success Director', 'Customer Success Manager', 'Support Specialist', 'Implementation Manager'],
      responsibilities: ['Customer satisfaction', 'Retention', 'Support', 'Implementation']
    },
    {
      id: 'legal',
      name: 'Legal',
      description: 'Responsible for legal compliance, contracts, and risk management',
      color: '#880E4F',
      roles: ['General Counsel', 'Legal Counsel', 'Compliance Manager', 'Contract Specialist'],
      responsibilities: ['Legal compliance', 'Contracts', 'Risk management', 'Intellectual property']
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Department Templates
      </Typography>
      
      <Typography variant="body1" paragraph>
        Select a pre-populated department template to quickly set up your organizational structure.
        Each template includes standard roles and responsibilities that you can customize to fit your needs.
      </Typography>
      
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3
                },
                borderLeft: `5px solid ${template.color}`
              }}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, color: template.color }} />
                    <Typography variant="h6">
                      {template.name}
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} /> Included Roles
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {template.roles.map((role, index) => (
                      <Chip key={index} label={role} size="small" />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon fontSize="small" sx={{ mr: 1 }} /> Key Responsibilities
                  </Typography>
                  <List dense>
                    {template.responsibilities.map((responsibility, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText primary={responsibility} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => onSelectTemplate(template.id)}
                  sx={{ mt: 1 }}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DepartmentTemplates;
