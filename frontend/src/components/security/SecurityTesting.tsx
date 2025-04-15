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
  Security as SecurityIcon,
  Link as LinkIcon,
  VerifiedUser as VerifiedUserIcon,
  Lock as LockIcon
} from '@mui/icons-material';

interface SecurityTestingProps {
  onRunTest: (testType: string) => void;
  onViewReport: (reportId: string) => void;
  onConfigureSecurity: () => void;
}

const SecurityTesting: React.FC<SecurityTestingProps> = ({
  onRunTest,
  onViewReport,
  onConfigureSecurity
}) => {
  // In a real implementation, these would be fetched from the Redux store
  const securityTests = [
    {
      id: '1',
      name: 'Link Security Test',
      description: 'Tests the security of shared links and access controls',
      lastRun: '2025-03-20T14:30:00Z',
      status: 'Passed',
      score: 92,
      issues: 1,
      type: 'Automated'
    },
    {
      id: '2',
      name: 'Input Validation Test',
      description: 'Tests input sanitization and validation across all forms',
      lastRun: '2025-03-18T10:15:00Z',
      status: 'Passed',
      score: 95,
      issues: 0,
      type: 'Automated'
    },
    {
      id: '3',
      name: 'Rate Limiting Test',
      description: 'Tests rate limiting functionality to prevent abuse',
      lastRun: '2025-03-15T09:45:00Z',
      status: 'Warning',
      score: 78,
      issues: 2,
      type: 'Automated'
    },
    {
      id: '4',
      name: 'Data Validation Test',
      description: 'Tests data validation before storage in Firestore',
      lastRun: '2025-03-10T11:30:00Z',
      status: 'Passed',
      score: 90,
      issues: 1,
      type: 'Manual'
    }
  ];

  const securityReports = [
    {
      id: '1',
      name: 'March 2025 Security Audit',
      date: '2025-03-22T15:30:00Z',
      type: 'Comprehensive',
      score: 88,
      issues: 4,
      status: 'Completed'
    },
    {
      id: '2',
      name: 'Link Security Analysis',
      date: '2025-03-15T10:45:00Z',
      type: 'Focused',
      score: 92,
      issues: 1,
      status: 'Completed'
    },
    {
      id: '3',
      name: 'Input Validation Review',
      date: '2025-03-10T14:15:00Z',
      type: 'Focused',
      score: 95,
      issues: 0,
      status: 'Completed'
    }
  ];

  const securityScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  const securityStatusColor = (status: string) => {
    if (status === 'Passed') return 'success';
    if (status === 'Warning') return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Security Testing</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onConfigureSecurity}>
            Configure Security
          </Button>
          <Button variant="contained" color="primary" onClick={() => onRunTest('comprehensive')}>
            Run Security Test
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" paragraph>
        Ensure your organizational data is protected with comprehensive security testing.
        Run automated tests, view security reports, and configure security settings.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '65%' } }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Security Tests</Typography>
            </Box>
            
            {securityTests.map((test) => (
              <Card key={test.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1">{test.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {test.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={test.status} 
                          size="small" 
                          color={securityStatusColor(test.status) as "success" | "warning" | "error" | "default"} 
                          sx={{ mr: 1 }} 
                        />
                        <Chip 
                          label={test.type} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="caption">
                          Last run: {new Date(test.lastRun).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `3px solid ${securityScoreColor(test.score)}`,
                          mb: 1
                        }}
                      >
                        <Typography variant="h6" sx={{ color: securityScoreColor(test.score) }}>
                          {test.score}
                        </Typography>
                      </Box>
                      <Typography variant="caption">
                        {test.issues} {test.issues === 1 ? 'issue' : 'issues'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => onRunTest(test.id)}
                      fullWidth
                    >
                      Run Test
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => onViewReport(test.id)}
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '32%' } }}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VerifiedUserIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Security Score</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `5px solid ${securityScoreColor(88)}`,
                  mb: 2
                }}
              >
                <Typography variant="h3" sx={{ color: securityScoreColor(88) }}>
                  88
                </Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                Overall Security Score
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Your application has a good security score. Address the identified issues to improve your score.
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => onRunTest('comprehensive')}
              >
                Run Comprehensive Test
              </Button>
            </Box>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LinkIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Security Reports</Typography>
            </Box>
            
            <List dense>
              {securityReports.map((report) => (
                <ListItem 
                  key={report.id} 
                  divider 
                  sx={{ 
                    borderLeft: `3px solid ${securityScoreColor(report.score)}`,
                    pl: 2
                  }}
                >
                  <ListItemText
                    primary={report.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Score: {report.score} • {report.issues} {report.issues === 1 ? 'issue' : 'issues'}
                        </Typography>
                        <br />
                        {new Date(report.date).toLocaleDateString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => onViewReport('all')}
              >
                View All Reports
              </Button>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LockIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Security Features</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Link-Based Security
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Secure access through unique links with customizable permissions and expiration.
                    </Typography>
                    <Chip label="Enabled" color="success" />
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Input Sanitization
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Protection against injection attacks through comprehensive input validation.
                    </Typography>
                    <Chip label="Enabled" color="success" />
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Rate Limiting
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Prevention of abuse through request rate limiting and monitoring.
                    </Typography>
                    <Chip label="Warning" color="warning" />
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Data Validation
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Ensures data integrity through validation before storage in Firestore.
                    </Typography>
                    <Chip label="Enabled" color="success" />
                  </CardContent>
                </Card>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onConfigureSecurity}
              >
                Configure Security Settings
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SecurityTesting;
