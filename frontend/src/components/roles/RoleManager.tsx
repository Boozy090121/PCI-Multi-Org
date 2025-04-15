import React from 'react';
import { Box, Typography, Paper, Grid, Button, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, FileCopy as CloneIcon, Compare as CompareIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchRoles, addRole, editRole, removeRole, duplicateRole, selectRole } from '../../store/slices/rolesSlice';
import RoleForm from './RoleForm';
import RoleList from './RoleList';
import RoleDetails from './RoleDetails';
import RoleComparison from './RoleComparison';
import { openModal, closeModal, addNotification } from '../../store/slices/uiSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RoleManager: React.FC = () => {
  const dispatch = useDispatch();
  const { items: roles, status, error, selectedRoleId, comparisonRoles } = useSelector((state: RootState) => state.roles);
  const { selectedDepartmentId } = useSelector((state: RootState) => state.departments);
  const { isOpen: isModalOpen, type: modalType } = useSelector((state: RootState) => state.ui.modal);
  const [tabValue, setTabValue] = React.useState(0);

  React.useEffect(() => {
    if (selectedDepartmentId && status === 'idle') {
      dispatch(fetchRoles(selectedDepartmentId));
    }
  }, [selectedDepartmentId, status, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddRole = () => {
    dispatch(openModal({ type: 'add-role' }));
  };

  const handleEditRole = (roleId: string) => {
    dispatch(selectRole(roleId));
    dispatch(openModal({ type: 'edit-role' }));
  };

  const handleDeleteRole = (roleId: string) => {
    dispatch(removeRole(roleId))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          message: 'Role deleted successfully'
        }));
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          message: `Failed to delete role: ${error.message}`
        }));
      });
  };

  const handleCloneRole = (roleId: string) => {
    dispatch(duplicateRole(roleId))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          message: 'Role cloned successfully'
        }));
        // Refresh roles after cloning
        if (selectedDepartmentId) {
          dispatch(fetchRoles(selectedDepartmentId));
        }
      })
      .catch((error) => {
        dispatch(addNotification({
          type: 'error',
          message: `Failed to clone role: ${error.message}`
        }));
      });
  };

  const handleSubmitRole = (role: any, isEdit: boolean) => {
    if (isEdit && selectedRoleId) {
      dispatch(editRole({ id: selectedRoleId, data: role }))
        .unwrap()
        .then(() => {
          dispatch(closeModal());
          dispatch(addNotification({
            type: 'success',
            message: 'Role updated successfully'
          }));
        })
        .catch((error) => {
          dispatch(addNotification({
            type: 'error',
            message: `Failed to update role: ${error.message}`
          }));
        });
    } else {
      dispatch(addRole({
        ...role,
        departmentId: selectedDepartmentId || '',
        organizationId: 'default' // This would be dynamic in a multi-tenant app
      }))
        .unwrap()
        .then(() => {
          dispatch(closeModal());
          dispatch(addNotification({
            type: 'success',
            message: 'Role added successfully'
          }));
        })
        .catch((error) => {
          dispatch(addNotification({
            type: 'error',
            message: `Failed to add role: ${error.message}`
          }));
        });
    }
  };

  if (!selectedDepartmentId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Please select a department first</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Role Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRole}
          disabled={!selectedDepartmentId}
        >
          Add Role
        </Button>
      </Box>

      {status === 'loading' && (
        <Typography>Loading roles...</Typography>
      )}

      {status === 'failed' && (
        <Typography color="error">Error: {error}</Typography>
      )}

      {status === 'succeeded' && (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="role management tabs">
              <Tab label="Roles List" id="role-tab-0" aria-controls="role-tabpanel-0" />
              {selectedRoleId && <Tab label="Role Details" id="role-tab-1" aria-controls="role-tabpanel-1" />}
              <Tab label="Role Comparison" id="role-tab-2" aria-controls="role-tabpanel-2" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <RoleList 
              roles={roles.filter(role => role.departmentId === selectedDepartmentId)} 
              onEdit={handleEditRole} 
              onDelete={handleDeleteRole}
              onClone={handleCloneRole}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {selectedRoleId && (
              <RoleDetails 
                role={roles.find(r => r.id === selectedRoleId)} 
              />
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <RoleComparison 
              roles={roles.filter(role => role.departmentId === selectedDepartmentId)}
            />
          </TabPanel>
        </Box>
      )}

      {isModalOpen && modalType === 'add-role' && (
        <RoleForm 
          onSubmit={(role) => handleSubmitRole(role, false)} 
          onCancel={() => dispatch(closeModal())} 
        />
      )}

      {isModalOpen && modalType === 'edit-role' && selectedRoleId && (
        <RoleForm 
          role={roles.find(r => r.id === selectedRoleId)} 
          onSubmit={(role) => handleSubmitRole(role, true)} 
          onCancel={() => dispatch(closeModal())} 
        />
      )}
    </Box>
  );
};

export default RoleManager;
