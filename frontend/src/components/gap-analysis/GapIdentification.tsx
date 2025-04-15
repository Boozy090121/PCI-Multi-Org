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
  Warning as WarningIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  AccountTree as AccountTreeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

interface GapIdentificationProps {
  onCreateGap: () => void;
  onEditGap: (gapId: string) => void;
  onResolveGap: (gapId: string) => void;
}

const GapIdentification: React.FC<GapIdentificationProps> = ({
  onCreateGap,
  onEditGap,
  onResolveGap
}) => {
  // In a real implementation, these would be fetched from the Redux store
  const gaps = [
    {
      id: '1',
      title: 'Engineering Manager Headcount Shortage',
      description: 'Current headcount is 2, but projected need is 4 based on team growth',
      type: 'Headcount',
      severity: 'High',
      department: 'Engineering',
      impact: 'Team oversight and project management capacity is limited',
      recommendation: 'Hire 2 additional Engineering Managers in Q2',
      status: 'Open'
    },
    {
      id: '2',
      title: 'UX Design Skills Gap',
      description: 'Current team lacks advanced UX research and testing skills',
      type: 'Skills',
      severity: 'Medium',
      department: 'Product',
      impact: 'Product usability issues are not being identified early in development',
      recommendation: 'Provide UX training for 3 team members and hire 1 UX specialist',
      status: 'In Progress'
    },
    {
      id: '3',
      title: 'Customer Onboarding Responsibility Overlap',
      description: 'Both Customer Success and Sales teams are performing onboarding activities',
      type: 'Responsibilities',
      severity: 'Medium',
      department: 'Multiple',
      impact: 'Inconsistent customer experience and inefficient resource allocation',
      recommendation: 'Clarify ownership and create a unified onboarding process',
      status: 'Open'
    },
    {
      id: '4',
      title: 'Unclear Reporting Structure in Marketing',
      description: 'Content team members report to both Content Lead and Marketing Director',
      type: 'Reporting',
      severity: 'Low',
      department: 'Marketing',
      impact: 'Conflicting priorities and confusion about approval processes',
      recommendation: 'Establish clear reporting lines with Content Lead as primary manager',
      status: 'Resolved'
    },
    {
      id: '5',
      title: 'Technical Documentation Responsibility Gap',
      description: 'No clear ownership of technical documentation maintenance',
      type: 'Responsibilities',
      severity: 'High',
      department: 'Engineering',
      impact: 'Documentation is outdated, leading to development inefficiencies',
      recommendation: 'Assign dedicated technical writer role or distribute responsibility with clear ownership',
      status: 'Open'
    }
  ];

  // Filter gaps by status
  const openGaps = gaps.filter(gap => gap.status === 'Open');
  const inProgressGaps = gaps.filter(gap => gap.status === 'In Progress');
  const resolvedGaps = gaps.filter(gap => gap.status === 'Resolved');

  const renderGapCard = (gap: typeof gaps[0]) => (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2,
        borderLeft: `5px solid ${
          gap.severity === 'High' ? '#f44336' :
          gap.severity === 'Medium' ? '#ff9800' :
          '#4caf50'
        }`
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {gap.type === 'Headcount' ? (
              <PeopleIcon sx={{ mr: 1 }} />
            ) : gap.type === 'Skills' ? (
              <SchoolIcon sx={{ mr: 1 }} />
            ) : gap.type === 'Responsibilities' ? (
              <AssignmentIcon sx={{ mr: 1 }} />
            ) : (
              <AccountTreeIcon sx={{ mr: 1 }} />
            )}
            <Typography variant="h6">
              {gap.title}
            </Typography>
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip 
              label={gap.type} 
              size="small" 
              color={
                gap.type === 'Headcount' ? 'primary' :
                gap.type === 'Skills' ? 'secondary' :
                gap.type === 'Responsibilities' ? 'info' :
                'default'
              }
            />
            <Chip 
              label={`${gap.severity} Severity`} 
              size="small" 
              color={
                gap.severity === 'High' ? 'error' :
                gap.severity === 'Medium' ? 'warning' :
                'success'
              }
            />
            <Chip 
              label={gap.department} 
              size="small" 
              variant="outlined"
            />
          </Box>
        }
      />
      <CardContent>
        <Typography variant="body2" paragraph>
          {gap.description}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Impact</Typography>
          <Typography variant="body2" color="text.secondary">
            {gap.impact}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Recommendation</Typography>
          <Typography variant="body2" color="text.secondary">
            {gap.recommendation}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => onEditGap(gap.id)}
            fullWidth
          >
            Edit
          </Button>
          {gap.status !== 'Resolved' && (
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              onClick={() => onResolveGap(gap.id)}
              fullWidth
            >
              {gap.status === 'Open' ? 'Start Resolution' : 'Mark Resolved'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Gap Identification</Typography>
        <Button variant="contained" color="primary" onClick={onCreateGap}>
          Create Gap
        </Button>
      </Box>

      <Typography variant="body1" paragraph>
        Identify and track gaps in your organizational structure across headcount, skills, responsibilities, and reporting relationships.
        Prioritize gaps by severity and track their resolution status.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '31%' }, height: '100%' }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">Open ({openGaps.length})</Typography>
            </Box>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              {openGaps.map(gap => renderGapCard(gap))}
              {openGaps.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No open gaps
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '31%' }, height: '100%' }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BugReportIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">In Progress ({inProgressGaps.length})</Typography>
            </Box>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              {inProgressGaps.map(gap => renderGapCard(gap))}
              {inProgressGaps.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No gaps in progress
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '31%' }, height: '100%' }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Resolved ({resolvedGaps.length})</Typography>
            </Box>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              {resolvedGaps.map(gap => renderGapCard(gap))}
              {resolvedGaps.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No resolved gaps
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Gap Types
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Headcount Gaps
                </Typography>
                <Typography variant="body2" paragraph>
                  Identifies where current staffing levels don't meet organizational needs.
                </Typography>
                <Chip label="Headcount" color="primary" />
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills Gaps
                </Typography>
                <Typography variant="body2" paragraph>
                  Identifies missing skills and competencies within teams.
                </Typography>
                <Chip label="Skills" color="secondary" />
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Responsibility Gaps
                </Typography>
                <Typography variant="body2" paragraph>
                  Identifies overlaps or missing ownership of responsibilities.
                </Typography>
                <Chip label="Responsibilities" color="info" />
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '47%', md: '22%' } }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reporting Gaps
                </Typography>
                <Typography variant="body2" paragraph>
                  Identifies unclear or conflicting reporting relationships.
                </Typography>
                <Chip label="Reporting" color="default" />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GapIdentification;
