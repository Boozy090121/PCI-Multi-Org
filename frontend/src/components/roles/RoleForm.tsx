import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

interface RoleFormProps {
  roleId?: string;
  departmentId: string;
  onSave: (roleData: any) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ roleId, departmentId, onSave, onCancel }) => {
  // In a real implementation, this would fetch the role from the Redux store if roleId is provided
  const [role, setRole] = useState(
    roleId
      ? {
          id: roleId,
          title: 'Senior Software Engineer',
          level: 'III',
          departmentId: departmentId,
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
        }
      : {
          title: '',
          level: '',
          departmentId: departmentId,
          responsibilities: [],
          clientInteraction: '',
          approvalAuthority: '',
          skills: [],
          experience: '',
          reporting: {
            reportsTo: [],
            directReports: []
          },
          headcount: {
            current: 0,
            projected: 0
          }
        }
  );

  const [newResponsibility, setNewResponsibility] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newReportsTo, setNewReportsTo] = useState('');
  const [newDirectReport, setNewDirectReport] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      if (name === 'current' || name === 'projected') {
        setRole({
          ...role,
          headcount: {
            ...role.headcount,
            [name]: Number(value)
          }
        });
      } else {
        setRole({
          ...role,
          [name]: value
        });
      }
    }
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setRole({
        ...role,
        responsibilities: [...role.responsibilities, newResponsibility.trim()]
      });
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    const updatedResponsibilities = [...role.responsibilities];
    updatedResponsibilities.splice(index, 1);
    setRole({
      ...role,
      responsibilities: updatedResponsibilities
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setRole({
        ...role,
        skills: [...role.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...role.skills];
    updatedSkills.splice(index, 1);
    setRole({
      ...role,
      skills: updatedSkills
    });
  };

  const handleAddReportsTo = () => {
    if (newReportsTo.trim()) {
      setRole({
        ...role,
        reporting: {
          ...role.reporting,
          reportsTo: [...role.reporting.reportsTo, newReportsTo.trim()]
        }
      });
      setNewReportsTo('');
    }
  };

  const handleRemoveReportsTo = (index: number) => {
    const updatedReportsTo = [...role.reporting.reportsTo];
    updatedReportsTo.splice(index, 1);
    setRole({
      ...role,
      reporting: {
        ...role.reporting,
        reportsTo: updatedReportsTo
      }
    });
  };

  const handleAddDirectReport = () => {
    if (newDirectReport.trim()) {
      setRole({
        ...role,
        reporting: {
          ...role.reporting,
          directReports: [...role.reporting.directReports, newDirectReport.trim()]
        }
      });
      setNewDirectReport('');
    }
  };

  const handleRemoveDirectReport = (index: number) => {
    const updatedDirectReports = [...role.reporting.directReports];
    updatedDirectReports.splice(index, 1);
    setRole({
      ...role,
      reporting: {
        ...role.reporting,
        directReports: updatedDirectReports
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(role);
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {roleId ? 'Edit Role' : 'Create New Role'}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={role.title}
              onChange={handleChange}
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Level</InputLabel>
              <Select name="level" value={role.level} onChange={handleChange} label="Level">
                <MenuItem value="">None</MenuItem>
                <MenuItem value="I">I</MenuItem>
                <MenuItem value="II">II</MenuItem>
                <MenuItem value="III">III</MenuItem>
                <MenuItem value="IV">IV</MenuItem>
                <MenuItem value="V">V</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Responsibilities
            </Typography>
            <List dense>
              {role.responsibilities.map((responsibility, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveResponsibility(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={responsibility} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                fullWidth
                label="Add Responsibility"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddResponsibility}
                sx={{ ml: 1, mt: 2 }}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Client Interaction"
              name="clientInteraction"
              value={role.clientInteraction}
              onChange={handleChange}
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Approval Authority"
              name="approvalAuthority"
              value={role.approvalAuthority}
              onChange={handleChange}
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {role.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                label="Add Skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddSkill}
                sx={{ ml: 1, mt: 2 }}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Experience"
              name="experience"
              value={role.experience}
              onChange={handleChange}
              placeholder="e.g., 3-5 years"
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Reports To
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {role.reporting.reportsTo.map((report, index) => (
                <Chip
                  key={index}
                  label={report}
                  onDelete={() => handleRemoveReportsTo(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                label="Add Reports To"
                value={newReportsTo}
                onChange={(e) => setNewReportsTo(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddReportsTo}
                sx={{ ml: 1, mt: 2 }}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Direct Reports
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {role.reporting.directReports.map((report, index) => (
                <Chip
                  key={index}
                  label={report}
                  onDelete={() => handleRemoveDirectReport(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                label="Add Direct Report"
                value={newDirectReport}
                onChange={(e) => setNewDirectReport(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddDirectReport}
                sx={{ ml: 1, mt: 2 }}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Headcount"
              name="current"
              type="number"
              value={role.headcount.current}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Projected Headcount"
              name="projected"
              type="number"
              value={role.headcount.projected}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={onCancel} startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>
                Save Role
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default RoleForm;
