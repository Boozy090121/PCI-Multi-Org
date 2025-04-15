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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon
} from '@mui/icons-material';

interface ImplementationFormProps {
  implementationId?: string;
  onSave: (implementationData: any) => void;
  onCancel: () => void;
}

const ImplementationForm: React.FC<ImplementationFormProps> = ({ implementationId, onSave, onCancel }) => {
  // In a real implementation, this would fetch the implementation plan from the Redux store if implementationId is provided
  const [implementation, setImplementation] = React.useState(
    implementationId
      ? {
          id: implementationId,
          name: 'Engineering Department Reorganization',
          description: 'Implementation plan for reorganizing the Engineering department',
          startDate: '2025-04-01',
          endDate: '2025-06-30',
          departments: ['Engineering'],
          phases: [
            {
              name: 'Planning',
              startDate: '2025-04-01',
              endDate: '2025-04-15',
              tasks: [
                {
                  name: 'Define new roles',
                  assignedTo: 'HR Director',
                  status: 'Completed',
                  dueDate: '2025-04-05'
                },
                {
                  name: 'Create transition plan',
                  assignedTo: 'Engineering Director',
                  status: 'In Progress',
                  dueDate: '2025-04-10'
                },
                {
                  name: 'Prepare communication plan',
                  assignedTo: 'Communications Manager',
                  status: 'Not Started',
                  dueDate: '2025-04-15'
                }
              ]
            },
            {
              name: 'Execution',
              startDate: '2025-04-16',
              endDate: '2025-06-15',
              tasks: [
                {
                  name: 'Announce changes',
                  assignedTo: 'CEO',
                  status: 'Not Started',
                  dueDate: '2025-04-16'
                },
                {
                  name: 'Conduct role transitions',
                  assignedTo: 'Engineering Director',
                  status: 'Not Started',
                  dueDate: '2025-05-15'
                },
                {
                  name: 'Fill new positions',
                  assignedTo: 'HR Director',
                  status: 'Not Started',
                  dueDate: '2025-06-15'
                }
              ]
            },
            {
              name: 'Evaluation',
              startDate: '2025-06-16',
              endDate: '2025-06-30',
              tasks: [
                {
                  name: 'Gather feedback',
                  assignedTo: 'HR Director',
                  status: 'Not Started',
                  dueDate: '2025-06-20'
                },
                {
                  name: 'Assess effectiveness',
                  assignedTo: 'Engineering Director',
                  status: 'Not Started',
                  dueDate: '2025-06-25'
                },
                {
                  name: 'Make adjustments',
                  assignedTo: 'Engineering Director',
                  status: 'Not Started',
                  dueDate: '2025-06-30'
                }
              ]
            }
          ],
          resources: [
            {
              name: 'HR Support',
              type: 'Personnel',
              quantity: 2,
              cost: 20000
            },
            {
              name: 'Training Budget',
              type: 'Financial',
              quantity: 1,
              cost: 15000
            },
            {
              name: 'Consulting Services',
              type: 'Service',
              quantity: 1,
              cost: 30000
            }
          ]
        }
      : {
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          departments: [],
          phases: [],
          resources: []
        }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setImplementation({
        ...implementation,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(implementation);
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {implementationId ? 'Edit Implementation Plan' : 'Create Implementation Plan'}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Plan Name"
              name="name"
              value={implementation.name}
              onChange={handleChange}
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={implementation.description}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={implementation.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={implementation.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Departments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {implementation.departments.map((department, index) => (
                <Chip
                  key={index}
                  label={department}
                  onDelete={() => {
                    const updatedDepartments = [...implementation.departments];
                    updatedDepartments.splice(index, 1);
                    setImplementation({
                      ...implementation,
                      departments: updatedDepartments
                    });
                  }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Add Department</InputLabel>
              <Select
                label="Add Department"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setImplementation({
                      ...implementation,
                      departments: [...implementation.departments, e.target.value as string]
                    });
                  }
                }}
              >
                <MenuItem value="">Select Department</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Product">Product</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Customer Success">Customer Success</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Implementation Phases
            </Typography>
            {implementation.phases.map((phase, phaseIndex) => (
              <Card key={phaseIndex} variant="outlined" sx={{ mb: 2, mt: 2 }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">{phase.name}</Typography>
                    </Box>
                  }
                  subheader={`${phase.startDate} to ${phase.endDate}`}
                  action={
                    <Button
                      color="error"
                      size="small"
                      onClick={() => {
                        const updatedPhases = [...implementation.phases];
                        updatedPhases.splice(phaseIndex, 1);
                        setImplementation({
                          ...implementation,
                          phases: updatedPhases
                        });
                      }}
                    >
                      Remove
                    </Button>
                  }
                />
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Tasks
                  </Typography>
                  <List dense>
                    {phase.tasks.map((task, taskIndex) => (
                      <ListItem
                        key={taskIndex}
                        secondaryAction={
                          <Button
                            color="error"
                            size="small"
                            onClick={() => {
                              const updatedPhases = [...implementation.phases];
                              updatedPhases[phaseIndex].tasks.splice(taskIndex, 1);
                              setImplementation({
                                ...implementation,
                                phases: updatedPhases
                              });
                            }}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={task.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {task.assignedTo}
                              </Typography>
                              {` — Due: ${task.dueDate} — Status: `}
                              <Chip
                                label={task.status}
                                size="small"
                                color={
                                  task.status === 'Completed'
                                    ? 'success'
                                    : task.status === 'In Progress'
                                    ? 'primary'
                                    : 'default'
                                }
                              />
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      const updatedPhases = [...implementation.phases];
                      updatedPhases[phaseIndex].tasks.push({
                        name: 'New Task',
                        assignedTo: '',
                        status: 'Not Started',
                        dueDate: phase.endDate
                      });
                      setImplementation({
                        ...implementation,
                        phases: updatedPhases
                      });
                    }}
                  >
                    Add Task
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                setImplementation({
                  ...implementation,
                  phases: [
                    ...implementation.phases,
                    {
                      name: 'New Phase',
                      startDate: implementation.startDate,
                      endDate: implementation.endDate,
                      tasks: []
                    }
                  ]
                });
              }}
            >
              Add Phase
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Resources
            </Typography>
            {implementation.resources.map((resource, resourceIndex) => (
              <Card key={resourceIndex} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{resource.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip
                          label={resource.type}
                          size="small"
                          color={
                            resource.type === 'Personnel'
                              ? 'primary'
                              : resource.type === 'Financial'
                              ? 'secondary'
                              : 'default'
                          }
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2">
                          Quantity: {resource.quantity} — Cost: ${resource.cost.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => {
                        const updatedResources = [...implementation.resources];
                        updatedResources.splice(resourceIndex, 1);
                        setImplementation({
                          ...implementation,
                          resources: updatedResources
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                setImplementation({
                  ...implementation,
                  resources: [
                    ...implementation.resources,
                    {
                      name: 'New Resource',
                      type: 'Personnel',
                      quantity: 1,
                      cost: 0
                    }
                  ]
                });
              }}
            >
              Add Resource
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Implementation Plan
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ImplementationForm;
