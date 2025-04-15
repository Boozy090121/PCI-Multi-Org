import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import { ChromePicker } from 'react-color';

interface Department {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (department: Omit<Department, 'id'>) => void;
  onCancel: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSubmit, onCancel }) => {
  const [name, setName] = useState(department?.name || '');
  const [color, setColor] = useState(department?.color || '#3f51b5');
  const [order, setOrder] = useState(department?.order || 0);
  const [nameError, setNameError] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setNameError('Department name is required');
      return;
    }
    
    onSubmit({
      name,
      color,
      order,
      organizationId: 'default' // This would be dynamic in a multi-tenant app
    });
  };

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {department ? 'Edit Department' : 'Add Department'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Department Name"
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setNameError('');
                }
              }}
              error={!!nameError}
              helperText={nameError}
              required
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Department Color
            </Typography>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: color,
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  mr: 2
                }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <TextField
                margin="dense"
                id="color"
                label="Color Code"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                variant="outlined"
                sx={{ flexGrow: 1 }}
              />
            </Box>
            {showColorPicker && (
              <Box sx={{ mt: 2, position: 'relative', zIndex: 2 }}>
                <Box 
                  sx={{ 
                    position: 'fixed', 
                    top: 0, 
                    right: 0, 
                    bottom: 0, 
                    left: 0,
                  }} 
                  onClick={() => setShowColorPicker(false)} 
                />
                <ChromePicker color={color} onChange={handleColorChange} />
              </Box>
            )}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              margin="dense"
              id="order"
              label="Display Order"
              type="number"
              fullWidth
              variant="outlined"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {department ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DepartmentForm;
