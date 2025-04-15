import React from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, FileCopy as ImportIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchDepartments, addDepartment, editDepartment, removeDepartment, selectDepartment } from '../../store/slices/departmentsSlice';
import DepartmentForm from './DepartmentForm';
import DepartmentList from './DepartmentList';
import { openModal, closeModal, addNotification } from '../../store/slices/uiSlice';

const DepartmentEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { items: departments, status, error, selectedDepartmentId } = useSelector((state: RootState) => state.departments);
  const { isOpen: isModalOpen, type: modalType } = useSelector((state: RootState) => state.ui.modal);

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDepartments());
    }
  }, [status, dispatch]);

  const handleAddDepartment = () => {
    dispatch(openModal({ type: 'add-department' }));
  };

  const handleEditDepartment = (departmentId: string) => {
    dispatch(selectDepartment(departmentId));
    dispatch(openModal({ type: 'edit-department' }));
  };

  const handleDeleteDepartment = (departmentId: string) => {
    dispatch(removeDepartment(departmentId))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          message: 'Department deleted successfully'
        }));
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          message: `Failed to delete department: ${error.message}`
        }));
      });
  };

  const handleImportDepartments = () => {
    dispatch(openModal({ type: 'import-departments' }));
  };

  const handleSubmitDepartment = (department: any, isEdit: boolean) => {
    if (isEdit && selectedDepartmentId) {
      dispatch(editDepartment({ id: selectedDepartmentId, data: department }))
        .unwrap()
        .then(() => {
          dispatch(closeModal());
          dispatch(addNotification({
            type: 'success',
            message: 'Department updated successfully'
          }));
        })
        .catch((error) => {
          dispatch(addNotification({
            type: 'error',
            message: `Failed to update department: ${error.message}`
          }));
        });
    } else {
      dispatch(addDepartment(department))
        .unwrap()
        .then(() => {
          dispatch(closeModal());
          dispatch(addNotification({
            type: 'success',
            message: 'Department added successfully'
          }));
        })
        .catch((error) => {
          dispatch(addNotification({
            type: 'error',
            message: `Failed to add department: ${error.message}`
          }));
        });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Department Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddDepartment}
            sx={{ mr: 1 }}
          >
            Add Department
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ImportIcon />}
            onClick={handleImportDepartments}
          >
            Import Departments
          </Button>
        </Box>
      </Box>

      {status === 'loading' && (
        <Typography>Loading departments...</Typography>
      )}

      {status === 'failed' && (
        <Typography color="error">Error: {error}</Typography>
      )}

      {status === 'succeeded' && (
        <DepartmentList 
          departments={departments} 
          onEdit={handleEditDepartment} 
          onDelete={handleDeleteDepartment} 
        />
      )}

      {isModalOpen && modalType === 'add-department' && (
        <DepartmentForm 
          onSubmit={(department) => handleSubmitDepartment(department, false)} 
          onCancel={() => dispatch(closeModal())} 
        />
      )}

      {isModalOpen && modalType === 'edit-department' && selectedDepartmentId && (
        <DepartmentForm 
          department={departments.find(d => d.id === selectedDepartmentId)} 
          onSubmit={(department) => handleSubmitDepartment(department, true)} 
          onCancel={() => dispatch(closeModal())} 
        />
      )}

      {isModalOpen && modalType === 'import-departments' && (
        <Box>
          {/* Import form would go here */}
          <Typography>Import Departments Form</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DepartmentEditor;
