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

interface RoleComparisonProps {
  roleId1: string;
  roleId2: string;
  onClose: () => void;
}

const RoleComparison: React.FC<RoleComparisonProps> = ({ roleId1, roleId2, onClose }) => {
  // In a real implementation, these would be fetched from the Redux store
  const role1 = {
    id: roleId1,
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
    }
  };

  const role2 = {
    id: roleId2,
    title: 'Technical Lead',
    level: 'IV',
    departmentId: 'engineering',
    responsibilities: [
      'Lead technical direction for projects',
      'Mentor senior engineers',
      'Make architecture decisions',
      'Coordinate with product and design teams',
      'Technical planning and roadmap development',
      'Cross-team technical coordination'
    ],
    clientInteraction: 'Regular client interaction for technical planning and issue resolution',
    approvalAuthority: 'Can approve technical decisions, architecture changes, and resource allocation',
    skills: [
      'JavaScript/TypeScript',
      'React',
      'Node.js',
      'System architecture',
      'Technical leadership',
      'Project planning',
      'Cross-team coordination'
    ],
    experience: '8+ years',
    reporting: {
      reportsTo: ['Engineering Director'],
      directReports: ['Senior Software Engineer', 'Software Engineer III']
    },
    headcount: {
      current: 1,
      projected: 2
    }
  };

  // Helper function to highlight differences
  const isDifferent = (value1: any, value2: any): boolean => {
    if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.length !== value2.length || value1.some((v, i) => v !== value2[i]);
    }
    return value1 !== value2;
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Role Comparison
        </Typography>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            {role1.title} {role1.level && `(${role1.level})`}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
            {role2.title} {role2.level && `(${role2.level})`}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 1 }} /> Responsibilities
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <List dense>
            {role1.responsibilities.map((responsibility, index) => (
              <ListItem key={index} sx={{ bgcolor: role2.responsibilities.includes(responsibility) ? 'transparent' : 'rgba(76, 175, 80, 0.1)' }}>
                <ListItemText primary={responsibility} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={6}>
          <List dense>
            {role2.responsibilities.map((responsibility, index) => (
              <ListItem key={index} sx={{ bgcolor: role1.responsibilities.includes(responsibility) ? 'transparent' : 'rgba(76, 175, 80, 0.1)' }}>
                <ListItemText primary={responsibility} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <BusinessIcon sx={{ mr: 1 }} /> Client Interaction
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ bgcolor: isDifferent(role1.clientInteraction, role2.clientInteraction) ? 'rgba(76, 175, 80, 0.1)' : 'transparent', p: 1 }}>
            {role1.clientInteraction}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ bgcolor: isDifferent(role1.clientInteraction, role2.clientInteraction) ? 'rgba(76, 175, 80, 0.1)' : 'transparent', p: 1 }}>
            {role2.clientInteraction}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 1 }} /> Approval Authority
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ bgcolor: isDifferent(role1.approvalAuthority, role2.approvalAuthority) ? 'rgba(76, 175, 80, 0.1)' : 'transparent', p: 1 }}>
            {role1.approvalAuthority}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ bgcolor: isDifferent(role1.approvalAuthority, role2.approvalAuthority) ? 'rgba(76, 175, 80, 0.1)' : 'transparent', p: 1 }}>
            {role2.approvalAuthority}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1 }} /> Required Skills
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {role1.skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small" 
                color={role2.skills.includes(skill) ? 'default' : 'primary'}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {role2.skills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small" 
                color={role1.skills.includes(skill) ? 'default' : 'secondary'}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1 }} /> Experience
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ bgcolor: isDifferent(role1.experience, role2.experience) ? 'rgba(76, 175, 80, 0.1)' : 'transparent', p: 1 }}>
            {role1.experience}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ bgcolor: isDifferent(role1.experience, role2.experience) ? 'rgba(76, 175, 80, 0.1)' : 'transparent', p: 1 }}>
            {role2.experience}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SupervisorIcon sx={{ mr: 1 }} /> Reporting Relationships
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Reports To</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {role1.reporting.reportsTo.map((report, index) => (
                <Chip 
                  key={index} 
                  label={report} 
                  size="small" 
                  variant="outlined" 
                  color={role2.reporting.reportsTo.includes(report) ? 'default' : 'primary'}
                />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">Direct Reports</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {role1.reporting.directReports.map((report, index) => (
                <Chip 
                  key={index} 
                  label={report} 
                  size="small" 
                  variant="outlined" 
                  color={role2.reporting.directReports.includes(report) ? 'default' : 'primary'}
                />
              ))}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Reports To</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {role2.reporting.reportsTo.map((report, index) => (
                <Chip 
                  key={index} 
                  label={report} 
                  size="small" 
                  variant="outlined" 
                  color={role1.reporting.reportsTo.includes(report) ? 'default' : 'secondary'}
                />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2">Direct Reports</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {role2.reporting.directReports.map((report, index) => (
                <Chip 
                  key={index} 
                  label={report} 
                  size="small" 
                  variant="outlined" 
                  color={role1.reporting.directReports.includes(report) ? 'default' : 'secondary'}
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PeopleIcon sx={{ mr: 1 }} /> Headcount
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2">Current</Typography>
              <Typography variant="h4" sx={{ color: isDifferent(role1.headcount.current, role2.headcount.current) ? 'primary.main' : 'inherit' }}>
                {role1.headcount.current}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Projected</Typography>
              <Typography variant="h4" sx={{ color: isDifferent(role1.headcount.projected, role2.headcount.projected) ? 'primary.main' : 'inherit' }}>
                {role1.headcount.projected}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2">Current</Typography>
              <Typography variant="h4" sx={{ color: isDifferent(role1.headcount.current, role2.headcount.current) ? 'secondary.main' : 'inherit' }}>
                {role2.headcount.current}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Projected</Typography>
              <Typography variant="h4" sx={{ color: isDifferent(role1.headcount.projected, role2.headcount.projected) ? 'secondary.main' : 'inherit' }}>
                {role2.headcount.projected}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={onClose}>
          Close Comparison
        </Button>
      </Box>
    </Paper>
  );
};

export default RoleComparison;
