import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Tooltip, 
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  NotificationsActive as NotificationsActiveIcon, 
  NotificationsOff as NotificationsOffIcon, 
  Settings as SettingsIcon,
  Chat as ChatIcon,
  Comment as CommentIcon,
  Forum as ForumIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';

const CollaborationSettings: React.FC = () => {
  const dispatch = useDispatch();
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [notifyOnEdit, setNotifyOnEdit] = useState(true);
  const [notifyOnComment, setNotifyOnComment] = useState(true);
  const [notifyOnShare, setNotifyOnShare] = useState(true);
  
  // Real-time collaboration settings
  const [showCursors, setShowCursors] = useState(true);
  const [showEdits, setShowEdits] = useState(true);
  const [enableChat, setEnableChat] = useState(true);
  const [enableComments, setEnableComments] = useState(true);
  
  // Handle saving settings
  const handleSaveSettings = () => {
    // This would dispatch an action to save the settings
    console.log('Saving collaboration settings');
    
    // Show success message
    alert('Settings saved successfully');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Collaboration Settings
      </Typography>
      
      <Typography variant="body1" paragraph>
        Configure notification preferences and real-time collaboration settings.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Notification Settings" 
              avatar={<NotificationsIcon />}
            />
            <CardContent>
              <Typography variant="body2" paragraph>
                Configure how and when you receive notifications about changes to your organization structure.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Notification Channels
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={inAppNotifications}
                      onChange={(e) => setInAppNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="In-App Notifications"
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Notification Events
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifyOnEdit}
                      onChange={(e) => setNotifyOnEdit(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="When someone edits the organization structure"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifyOnComment}
                      onChange={(e) => setNotifyOnComment(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="When someone comments on an item"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifyOnShare}
                      onChange={(e) => setNotifyOnShare(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="When someone shares the organization structure"
                />
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Email notifications will be sent to the email address associated with your account.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader 
              title="Real-Time Collaboration" 
              avatar={<SettingsIcon />}
            />
            <CardContent>
              <Typography variant="body2" paragraph>
                Configure how real-time collaboration works when multiple users are editing the organization structure.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Visibility Settings
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={showCursors}
                      onChange={(e) => setShowCursors(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show other users' cursors"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={showEdits}
                      onChange={(e) => setShowEdits(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Highlight recent edits by other users"
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Communication Tools
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableChat}
                      onChange={(e) => setEnableChat(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable real-time chat"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableComments}
                      onChange={(e) => setEnableComments(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable comments on items"
                />
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Real-time collaboration features help team members work together effectively on the organization structure.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollaborationSettings;
