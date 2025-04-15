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
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

interface RoleListProps {
  departmentId: string;
  onSelectRole: (roleId: string) => void;
  onEditRole: (roleId: string) => void;
  onDeleteRole: (roleId: string) => void;
  onAddRole: () => void;
}

const RoleList: React.FC<RoleListProps> = ({
  departmentId,
  onSelectRole,
  onEditRole,
  onDeleteRole,
  onAddRole
}) => {
  // In a real implementation, this would fetch roles from the Redux store
  const roles = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      level: 'III',
      departmentId: 'engineering',
      responsibilities: [
        'Lead development of complex features',
        'Mentor junior engineers',
        'Participate in architecture decisions'
      ],
      skills: ['JavaScript/TypeScript', 'React', 'Node.js'],
      headcount: {
        current: 3,
        projected: 5
      }
    },
    {
      id: '2',
      title: 'Software Engineer',
      level: 'II',
      departmentId: 'engineering',
      responsibilities: [
        'Implement features',
        'Write unit tests',
        'Participate in code reviews'
      ],
      skills: ['JavaScript', 'React', 'HTML/CSS'],
      headcount: {
        current: 5,
        projected: 7
      }
    },
    {
      id: '3',
      title: 'Junior Software Engineer',
      level: 'I',
      departmentId: 'engineering',
      responsibilities: [
        'Implement simple features',
        'Fix bugs',
        'Write documentation'
      ],
      skills: ['JavaScript', 'HTML/CSS'],
      headcount: {
        current: 2,
        projected: 4
      }
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Roles</Typography>
        <Button variant="contained" color="primary" onClick={onAddRole}>
          Add Role
        </Button>
      </Box>

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={6} lg={4} key={role.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={() => onSelectRole(role.id)}
            >
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {role.title} {role.level && `(${role.level})`}
                    </Typography>
                  </Box>
                }
                action={
                  <Box>
                    <Button size="small" onClick={(e) => {
                      e.stopPropagation();
                      onEditRole(role.id);
                    }}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRole(role.id);
                    }}>
                      Delete
                    </Button>
                  </Box>
                }
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon fontSize="small" sx={{ mr: 1 }} /> Key Responsibilities
                  </Typography>
                  <List dense>
                    {role.responsibilities.slice(0, 3).map((responsibility, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText primary={responsibility} />
                      </ListItem>
                    ))}
                    {role.responsibilities.length > 3 && (
                      <ListItem disablePadding>
                        <ListItemText primary={`+${role.responsibilities.length - 3} more...`} />
                      </ListItem>
                    )}
                  </List>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {role.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box>
                    <Typography variant="caption">Current</Typography>
                    <Typography variant="h6">{role.headcount.current}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption">Projected</Typography>
                    <Typography variant="h6">{role.headcount.projected}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption">Gap</Typography>
                    <Typography variant="h6" color={role.headcount.projected - role.headcount.current > 0 ? 'error' : 'success'}>
                      {role.headcount.projected - role.headcount.current}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoleList;
