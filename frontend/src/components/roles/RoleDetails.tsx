import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface RoleDetailsProps {
  roleId: string;
  onEdit: (roleId: string) => void;
  onClone: (roleId: string) => void;
  onCompare: (roleId: string) => void;
}

const RoleDetails: React.FC<RoleDetailsProps> = ({ roleId, onEdit, onClone, onCompare }) => {
  // In a real implementation, this would fetch the role from the Redux store
  const role = {
    id: roleId,
    title: 'Senior Software Engineer',
    level: 'III',
    departmentId: 'engineering',
    responsibilities: [
      'Lead development of complex features',
      'Mentor junior engineers',
      'Participate in architecture decisions',
      'Code reviews and quality assurance',
      'Technical documentation'
    ],
    clientInteraction: 'Limited client interaction for technical requirements clarification',
    approvalAuthority: 'Can approve code changes and minor technical decisions',
    skills: [
      'JavaScript/TypeScript',
      'React',
      'Node.js',
      'Database design',
      'System architecture',
      'CI/CD pipelines'
    ],
    experience: '5-7 years',
    reporting: {
      reportsTo: ['Engineering Manager', 'Technical Lead'],
      directReports: ['Software Engineer I', 'Software Engineer II']
    },
    headcount: {
      current: 3,
      projected: 5
    },
    version: 2,
    previousVersions: [
      {
        version: 1,
        updatedAt: '2025-01-15T10:30:00Z',
        changes: ['Initial role definition']
      }
    ],
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-03-20T14:45:00Z'
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {role.title} {role.level && `(${role.level})`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Department: Engineering
          </Typography>
        </Box>
        <Box>
          <Button variant="outlined" size="small" onClick={() => onEdit(roleId)} sx={{ mr: 1 }}>
            Edit Role
          </Button>
          <Button variant="outlined" size="small" onClick={() => onClone(roleId)} sx={{ mr: 1 }}>
            Clone Role
          </Button>
          <Button variant="outlined" size="small" onClick={() => onCompare(roleId)}>
            Compare
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} /> Responsibilities
            </Typography>
            <List dense>
              {role.responsibilities.map((responsibility, index) => (
                <ListItem key={index}>
                  <ListItemText primary={responsibility} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ mr: 1 }} /> Client Interaction
            </Typography>
            <Typography variant="body2">{role.clientInteraction}</Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} /> Approval Authority
            </Typography>
            <Typography variant="body2">{role.approvalAuthority}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} /> Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {role.skills.map((skill, index) => (
                <Chip key={index} label={skill} size="small" />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} /> Experience
            </Typography>
            <Typography variant="body2">{role.experience}</Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SupervisorIcon sx={{ mr: 1 }} /> Reporting Relationships
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label="Reports To" 
                sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }} 
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {role.reporting.reportsTo.map((report, index) => (
                  <Chip key={index} label={report} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Chip 
                label="Direct Reports" 
                sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }} 
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {role.reporting.directReports.map((report, index) => (
                  <Chip key={index} label={report} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1 }} /> Headcount
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2">Current</Typography>
                <Typography variant="h4">{role.headcount.current}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Projected</Typography>
                <Typography variant="h4">{role.headcount.projected}</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Version History
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`Current (v${role.version})`} color="primary" size="small" />
          {role.previousVersions.map((version, index) => (
            <Chip key={index} label={`v${version.version}`} variant="outlined" size="small" />
          ))}
        </Box>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Last updated: {new Date(role.updatedAt).toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RoleDetails;
