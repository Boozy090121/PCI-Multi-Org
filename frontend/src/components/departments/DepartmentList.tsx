import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Paper, 
  Box, 
  Typography,
  Divider,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { reorderDepartments } from '../../store/slices/departmentsSlice';

interface Department {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface DepartmentListProps {
  departments: Department[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DepartmentList: React.FC<DepartmentListProps> = ({ departments, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  
  // Sort departments by order
  const sortedDepartments = [...departments].sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // If position didn't change
    if (sourceIndex === destinationIndex) {
      return;
    }

    // Create a new array of departments with updated orders
    const updatedDepartments = [...sortedDepartments];
    const [removed] = updatedDepartments.splice(sourceIndex, 1);
    updatedDepartments.splice(destinationIndex, 0, removed);

    // Update orders
    const reorderedDepartments = updatedDepartments.map((dept, index) => ({
      id: dept.id,
      newOrder: index
    }));

    // Dispatch action to update orders in store
    dispatch(reorderDepartments(reorderedDepartments));
  };

  return (
    <Paper elevation={2}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Departments
        </Typography>
        {sortedDepartments.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
            No departments found. Create your first department to get started.
          </Typography>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="departments">
              {(provided) => (
                <Grid 
                  container 
                  spacing={2}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {sortedDepartments.map((department, index) => (
                    <Draggable key={department.id} draggableId={department.id} index={index}>
                      {(provided) => (
                        <Grid item xs={12} sm={6} md={4} lg={3}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Card 
                            sx={{ 
                              borderLeft: `6px solid ${department.color}`,
                              height: '100%'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    {...provided.dragHandleProps}
                                    sx={{ 
                                      cursor: 'grab', 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      mr: 1
                                    }}
                                  >
                                    <DragIcon fontSize="small" color="action" />
                                  </Box>
                                  <Typography variant="h6" component="h3">
                                    {department.name}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Tooltip title="Edit Department">
                                    <IconButton 
                                      edge="end" 
                                      aria-label="edit" 
                                      onClick={() => onEdit(department.id)}
                                      size="small"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Department">
                                    <IconButton 
                                      edge="end" 
                                      aria-label="delete" 
                                      onClick={() => onDelete(department.id)}
                                      size="small"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                  Order: {department.order}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                                    Color:
                                  </Typography>
                                  <Box 
                                    sx={{ 
                                      width: 16, 
                                      height: 16, 
                                      borderRadius: '50%', 
                                      bgcolor: department.color,
                                      border: '1px solid #ccc'
                                    }} 
                                  />
                                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                                    {department.color}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Grid>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Box>
    </Paper>
  );
};

export default DepartmentList;
