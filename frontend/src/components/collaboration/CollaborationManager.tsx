import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
  People as PeopleIcon,
  Share as ShareIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface CollaborationManagerProps {
  onCreateSharedLink: () => void;
  onManageAccess: () => void;
  onViewActivity: () => void;
}

const CollaborationManager: React.FC<CollaborationManagerProps> = ({
  onCreateSharedLink,
  onManageAccess,
  onViewActivity
}) => {
  // In a real implementation, these would be fetched from the Redux store
  const collaborators = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Editor',
      lastActive: '2025-03-22T14:30:00Z',
      departments: ['Engineering', 'Product']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Viewer',
      lastActive: '2025-03-21T09:15:00Z',
      departments: ['Marketing', 'Sales']
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      role: 'Editor',
      lastActive: '2025-03-20T16:45:00Z',
      departments: ['HR', 'Operations']
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'Viewer',
      lastActive: '2025-03-19T11:30:00Z',
      departments: ['Finance']
    }
  ];

  const sharedLinks = [
    {
      id: '1',
      name: 'Engineering Team Access',
      url: 'https://org-structure-app.web.app/share/eng-team-2025',
      accessLevel: 'Editor',
      createdAt: '2025-03-15T10:30:00Z',
      expiresAt: '2025-06-15T10:30:00Z',
      views: 24
    },
    {
      id: '2',
      name: 'Executive Review',
      url: 'https://org-structure-app.web.app/share/exec-review-2025',
      accessLevel: 'Viewer',
      createdAt: '2025-03-18T14:45:00Z',
      expiresAt: '2025-04-18T14:45:00Z',
      views: 8
    },
    {
      id: '3',
      name: 'HR Department Access',
      url: 'https://org-structure-app.web.app/share/hr-dept-2025',
      accessLevel: 'Editor',
      createdAt: '2025-03-20T09:15:00Z',
      expiresAt: null,
      views: 12
    }
  ];

  const recentActivities = [
    {
      id: '1',
      user: 'John Smith',
      action: 'Updated Engineering department structure',
      timestamp: '2025-03-22T14:30:00Z',
      type: 'Edit'
    },
    {
      id: '2',
      user: 'Sarah Johnson',
      action: 'Viewed Marketing roles',
      timestamp: '2025-03-21T09:15:00Z',
      type: 'View'
    },
    {
      id: '3',
      user: 'Michael Chen',
      action: 'Added new role: Senior Product Manager',
      timestamp: '2025-03-20T16:45:00Z',
      type: 'Create'
    },
    {
      id: '4',
      user: 'John Smith',
      action: 'Updated responsibility matrix',
      timestamp: '2025-03-20T11:30:00Z',
      type: 'Edit'
    },
    {
      id: '5',
      user: 'Emily Davis',
      action: 'Viewed organizational chart',
      timestamp: '2025-03-19T11:30:00Z',
      type: 'View'
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Collaboration</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onManageAccess}>
            Manage Access
          </Button>
          <Button variant="contained" color="primary" onClick={onCreateSharedLink}>
            Create Shared Link
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" paragraph>
        Collaborate with team members by sharing access to your organizational structure.
        Create shared links with different access levels and monitor activity.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '48%' } }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Collaborators</Typography>
            </Box>
            
            {collaborators.map((collaborator) => (
              <Card key={collaborator.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1">{collaborator.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {collaborator.email}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={collaborator.role} 
                          size="small" 
                          color={collaborator.role === 'Editor' ? 'primary' : 'default'} 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="caption">
                          Last active: {new Date(collaborator.lastActive).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" color="primary">
                      Edit Access
                    </Button>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption">Department Access</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {collaborator.departments.map((department, index) => (
                        <Chip key={index} label={department} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outlined" fullWidth>
              Invite Collaborator
            </Button>
          </Paper>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '48%' } }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShareIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Shared Links</Typography>
            </Box>
            
            {sharedLinks.map((link) => (
              <Card key={link.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1">{link.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {link.url}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={link.accessLevel} 
                          size="small" 
                          color={link.accessLevel === 'Editor' ? 'primary' : 'default'} 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="caption">
                          {link.views} views
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" color="primary">
                        Copy
                      </Button>
                      <Button size="small" color="error">
                        Revoke
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      Created: {new Date(link.createdAt).toLocaleDateString()}
                      {link.expiresAt ? ` • Expires: ${new Date(link.expiresAt).toLocaleDateString()}` : ' • No expiration'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outlined" fullWidth onClick={onCreateSharedLink}>
              Create New Link
            </Button>
          </Paper>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Activity</Typography>
              </Box>
              <Button size="small" color="primary" onClick={onViewActivity}>
                View All Activity
              </Button>
            </Box>
            
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                          <strong>{activity.user}</strong> {activity.action}
                        </Typography>
                        <Chip 
                          label={activity.type} 
                          size="small" 
                          color={
                            activity.type === 'Edit' ? 'primary' :
                            activity.type === 'Create' ? 'success' :
                            'default'
                          } 
                          sx={{ ml: 1 }} 
                        />
                      </Box>
                    }
                    secondary={new Date(activity.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Collaboration Settings
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Access Control
                </Typography>
                <Typography variant="body2" paragraph>
                  Configure who can view and edit your organizational structure.
                  Set department-specific permissions and access levels.
                </Typography>
                <Button variant="outlined" color="primary">
                  Manage Access Control
                </Button>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '48%' } }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Typography variant="body2" paragraph>
                  Configure when and how you receive notifications about changes
                  to your organizational structure.
                </Typography>
                <Button variant="outlined" color="primary">
                  Manage Notifications
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CollaborationManager;
