import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  Calculate as CalculateIcon,
  BubbleChart as ChartIcon,
  FindInPage as FindIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';

const UserOnboarding: React.FC = () => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showDialog, setShowDialog] = useState(true);

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle skip onboarding
  const handleSkip = () => {
    setOnboardingComplete(true);
    setShowDialog(false);
    
    // This would dispatch an action to mark onboarding as complete
    console.log('Onboarding skipped');
  };

  // Handle complete onboarding
  const handleComplete = () => {
    setOnboardingComplete(true);
    setShowDialog(false);
    
    // This would dispatch an action to mark onboarding as complete
    console.log('Onboarding completed');
  };

  // Onboarding steps
  const steps = [
    {
      label: 'Welcome to the Organizational Structure Management App',
      description: `Welcome to your new organizational structure management application! This tool will help you manage your organization's departments, roles, responsibilities, and headcount planning. Let's take a quick tour to get you started.`,
      icon: <BusinessIcon />,
      image: '/assets/welcome.png'
    },
    {
      label: 'Department & Role Management',
      description: `Create and manage departments with color-coding for visual differentiation. Define roles within departments with standardized fields including responsibilities, client interaction scope, approval authorities, and more.`,
      icon: <PeopleIcon />,
      image: '/assets/departments.png'
    },
    {
      label: 'Cross-Departmental Alignment',
      description: `Use the responsibility matrix to visualize how roles and responsibilities are distributed across departments. Identify overlaps and gaps with color-highlighted indicators.`,
      icon: <AccountTreeIcon />,
      image: '/assets/alignment.png'
    },
    {
      label: 'Headcount Calculation',
      description: `Calculate optimal staffing levels based on workload metrics. Simulate different scenarios to project future headcount needs and visualize the results.`,
      icon: <CalculateIcon />,
      image: '/assets/headcount.png'
    },
    {
      label: 'Organizational Visualization',
      description: `View your organization structure in an interactive chart. Zoom, pan, and export the chart in various formats for presentations and documentation.`,
      icon: <ChartIcon />,
      image: '/assets/orgchart.png'
    },
    {
      label: 'Gap Analysis & Implementation',
      description: `Identify organizational gaps and create implementation plans to address them. Track progress and manage resources for a smooth reorganization.`,
      icon: <FindIcon />,
      image: '/assets/gaps.png'
    },
    {
      label: 'Collaboration & Sharing',
      description: `Share your organization structure with team members using link-based access. Collaborate in real-time with activity tracking and notifications.`,
      icon: <ShareIcon />,
      image: '/assets/collaboration.png'
    }
  ];

  return (
    <>
      <Dialog
        open={showDialog}
        fullWidth
        maxWidth="md"
        onClose={handleSkip}
        aria-labelledby="onboarding-dialog-title"
      >
        <DialogTitle id="onboarding-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Getting Started</Typography>
          <IconButton
            aria-label="close"
            onClick={handleSkip}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel StepIconComponent={() => (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: index === activeStep ? 'primary.main' : 'grey.200',
                    color: index === activeStep ? 'white' : 'grey.500'
                  }}>
                    {step.icon}
                  </Box>
                )}>
                  <Typography variant="subtitle1" fontWeight="bold">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardMedia
                        component="img"
                        height="250"
                        image={step.image || '/assets/placeholder.png'}
                        alt={step.label}
                        sx={{ objectFit: 'contain', bgcolor: 'grey.100', p: 2 }}
                      />
                      <CardContent>
                        <Typography variant="body1">{step.description}</Typography>
                      </CardContent>
                    </Card>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                      >
                        Back
                      </Button>
                      <Box>
                        <Button
                          variant="text"
                          onClick={handleSkip}
                          sx={{ mr: 1 }}
                        >
                          Skip Tour
                        </Button>
                        {index === steps.length - 1 ? (
                          <Button
                            variant="contained"
                            onClick={handleComplete}
                            endIcon={<CheckCircleIcon />}
                          >
                            Finish
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={<ArrowForwardIcon />}
                          >
                            Next
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* This would be shown after onboarding is complete or skipped */}
      {onboardingComplete && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Your Organization Structure Management App
          </Typography>
          
          <Typography variant="body1" paragraph>
            You're all set to start managing your organization structure. Here are some quick actions to get started:
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 1 }} /> Create Your First Department
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Start by creating your first department or import from our templates.
                  </Typography>
                  <Button variant="contained" color="primary">
                    Create Department
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountTreeIcon sx={{ mr: 1 }} /> Define Roles
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Add roles to your departments with standardized fields.
                  </Typography>
                  <Button variant="contained" color="primary">
                    Define Roles
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShareIcon sx={{ mr: 1 }} /> Invite Team Members
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Share your organization structure with your team.
                  </Typography>
                  <Button variant="contained" color="primary">
                    Invite Team
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" paragraph>
              You can restart the onboarding tour or access help resources at any time.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<HelpIcon />}
              onClick={() => setShowDialog(true)}
            >
              Restart Tour
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default UserOnboarding;
