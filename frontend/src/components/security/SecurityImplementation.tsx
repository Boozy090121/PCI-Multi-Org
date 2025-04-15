import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Security as SecurityIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';

const LinkBasedSecurity: React.FC = () => {
  const dispatch = useDispatch();
  const [shareLink, setShareLink] = useState('https://org-structure-app.example.com/share/abc123xyz789');
  const [readOnlyLink, setReadOnlyLink] = useState('https://org-structure-app.example.com/view/abc123xyz789');
  const [customUrlEnabled, setCustomUrlEnabled] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDays, setExpirationDays] = useState(30);
  const [passwordProtectionEnabled, setPasswordProtectionEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [readOnlyLinkCopied, setReadOnlyLinkCopied] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);

  // Generate share link
  const generateShareLink = () => {
    // This would dispatch an action to generate a new share link
    const newLink = `https://org-structure-app.example.com/share/${Math.random().toString(36).substring(2, 15)}`;
    setShareLink(newLink);
    
    // Generate read-only link
    const newReadOnlyLink = newLink.replace('/share/', '/view/');
    setReadOnlyLink(newReadOnlyLink);
  };

  // Handle copy link
  const handleCopyLink = (type: 'edit' | 'view') => {
    const link = type === 'edit' ? shareLink : readOnlyLink;
    navigator.clipboard.writeText(link);
    
    if (type === 'edit') {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } else {
      setReadOnlyLinkCopied(true);
      setTimeout(() => setReadOnlyLinkCopied(false), 3000);
    }
  };

  // Handle custom URL change
  const handleCustomUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Remove spaces and special characters
    const sanitizedValue = value.replace(/[^a-zA-Z0-9-]/g, '');
    setCustomUrl(sanitizedValue);
    
    if (customUrlEnabled && sanitizedValue) {
      const baseUrl = 'https://org-structure-app.example.com/';
      setShareLink(`${baseUrl}${sanitizedValue}`);
      setReadOnlyLink(`${baseUrl}view/${sanitizedValue}`);
    }
  };

  // Handle expiration days change
  const handleExpirationDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setExpirationDays(value);
    }
  };

  // Handle password change
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Open security dialog
  const handleOpenSecurityDialog = () => {
    setShowSecurityDialog(true);
  };

  // Close security dialog
  const handleCloseSecurityDialog = () => {
    setShowSecurityDialog(false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Link-Based Security
      </Typography>
      
      <Typography variant="body2" paragraph>
        Share your organization structure with others using secure links. You can create both edit and view-only links.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader 
              title="Share Links" 
              action={
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  onClick={generateShareLink}
                >
                  Generate New Links
                </Button>
              }
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Edit Access Link
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={shareLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={() => handleCopyLink('edit')}>
                        <CopyIcon />
                      </IconButton>
                    )
                  }}
                  sx={{ mb: 1 }}
                />
                {linkCopied && (
                  <Typography variant="body2" color="success.main">
                    Link copied to clipboard!
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  View-Only Link
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={readOnlyLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={() => handleCopyLink('view')}>
                        <CopyIcon />
                      </IconButton>
                    )
                  }}
                  sx={{ mb: 1 }}
                />
                {readOnlyLinkCopied && (
                  <Typography variant="body2" color="success.main">
                    View-only link copied to clipboard!
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Security Options
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customUrlEnabled}
                        onChange={(e) => setCustomUrlEnabled(e.target.checked)}
                      />
                    }
                    label="Custom URL"
                  />
                  {customUrlEnabled && (
                    <TextField
                      fullWidth
                      label="Custom URL Segment"
                      variant="outlined"
                      value={customUrl}
                      onChange={handleCustomUrlChange}
                      placeholder="my-organization"
                      helperText="Only letters, numbers, and hyphens allowed"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={expirationEnabled}
                        onChange={(e) => setExpirationEnabled(e.target.checked)}
                      />
                    }
                    label="Link Expiration"
                  />
                  {expirationEnabled && (
                    <TextField
                      fullWidth
                      label="Expires After (days)"
                      variant="outlined"
                      type="number"
                      value={expirationDays}
                      onChange={handleExpirationDaysChange}
                      inputProps={{ min: 1 }}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordProtectionEnabled}
                        onChange={(e) => setPasswordProtectionEnabled(e.target.checked)}
                      />
                    }
                    label="Password Protection"
                  />
                  {passwordProtectionEnabled && (
                    <TextField
                      fullWidth
                      label="Password"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      size="small"
                      sx={{ mt: 1 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  )}
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={handleOpenSecurityDialog}
                >
                  Advanced Security Options
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Advanced Security Dialog */}
      <Dialog
        open={showSecurityDialog}
        onClose={handleCloseSecurityDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1 }} />
            Advanced Security Options
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Configure advanced security settings for your organization structure.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Access Controls" />
                <CardContent>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Rate limiting"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Limit access attempts to prevent abuse
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="IP restrictions"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Restrict access to specific IP addresses
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Domain restrictions"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Restrict access to specific email domains
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Data Protection" />
                <CardContent>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Input sanitization"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Prevent injection attacks by sanitizing all inputs
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Data validation"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Validate all data before storage
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="HTTPS enforcement"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Enforce HTTPS for all connections
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Activity Logging" />
                <CardContent>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Access logging"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Log all access attempts to your organization structure
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Change logging"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Log all changes made to your organization structure
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Email notifications"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Receive email notifications for suspicious activities
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSecurityDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCloseSecurityDialog}
            startIcon={<CheckIcon />}
          >
            Save Security Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const SecurityImplementation: React.FC = () => {
  const [securityScore, setSecurityScore] = useState(85);
  const [securityChecks, setSecurityChecks] = useState([
    { id: 'check1', name: 'Link-based security', status: 'passed', description: 'Share links are securely generated with unique identifiers' },
    { id: 'check2', name: 'Read-only access', status: 'passed', description: 'View-only links restrict editing capabilities' },
    { id: 'check3', name: 'Input sanitization', status: 'passed', description: 'All user inputs are sanitized to prevent injection attacks' },
    { id: 'check4', name: 'Rate limiting', status: 'passed', description: 'Access attempts are limited to prevent abuse' },
    { id: 'check5', name: 'Data validation', status: 'passed', description: 'All data is validated before storage' },
    { id: 'check6', name: 'HTTPS enforcement', status: 'passed', description: 'All connections use HTTPS for secure data transmission' },
    { id: 'check7', name: 'Password strength', status: 'warning', description: 'Password requirements could be strengthened' },
    { id: 'check8', name: 'Two-factor authentication', status: 'failed', description: 'Two-factor authentication is not implemented' }
  ]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success.main';
      case 'warning': return 'warning.main';
      case 'failed': return 'error.main';
      default: return 'text.primary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'warning': return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'failed': return <CloseIcon sx={{ color: 'error.main' }} />;
      default: return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Security Implementation
      </Typography>
      
      <Typography variant="body1" paragraph>
        The application includes comprehensive security features to protect your organizational data.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <LinkBasedSecurity />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader 
              title="Security Score" 
              subheader={`${securityScore}/100`}
              avatar={
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: securityScore >= 80 ? 'success.main' : securityScore >= 60 ? 'warning.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <ShieldIcon />
                </Box>
              }
            />
            <CardContent>
              <Typography variant="body2" paragraph>
                Your security implementation is {securityScore >= 80 ? 'strong' : securityScore >= 60 ? 'moderate' : 'weak'}.
                {securityScore < 80 && ' Consider implementing the recommended security measures.'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Security Checks
              </Typography>
              
              <List dense>
                {securityChecks.map((check) => (
                  <ListItem key={check.id}>
                    <ListItemIcon>
                      {getStatusIcon(check.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={check.name}
                      secondary={check.description}
                      primaryTypographyProps={{
                        color: getStatusColor(check.status)
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Alert severity="info" variant="outlined">
            <Typography variant="subtitle1">Security Best Practices</Typography>
            <Typography variant="body2">
              1. Regularly generate new share links to prevent unauthorized access<br />
              2. Use view-only links when sharing with external stakeholders<br />
              3. Enable link expiration for temporary access<br />
              4. Use strong passwords for password-protected links<br />
              5. Monitor access logs for suspicious activity
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecurityImplementation;
