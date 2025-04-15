import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
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
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

interface RoleTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
}

const RoleTemplates: React.FC<RoleTemplatesProps> = ({ onSelectTemplate }) => {
  // In a real implementation, these would be fetched from the backend
  const templates = [
    // Leadership roles
    {
      id: 'department-head',
      category: 'Leadership',
      name: 'Department Head',
      description: 'Leads and manages the entire department, responsible for strategic direction and team management',
      responsibilities: [
        'Set department strategy and goals',
        'Manage team performance and development',
        'Coordinate with other departments',
        'Budget planning and resource allocation',
        'Report to executive leadership'
      ],
      clientInteraction: 'Regular client interaction for strategic partnerships and escalations',
      approvalAuthority: 'Can approve all department decisions, budgets, and resource allocations',
      skills: ['Leadership', 'Strategic planning', 'Team management', 'Budgeting', 'Communication'],
      experience: '8+ years',
      reporting: {
        reportsTo: ['Executive Leadership'],
        directReports: ['Team Manager', 'Senior Specialist']
      }
    },
    {
      id: 'team-manager',
      category: 'Leadership',
      name: 'Team Manager',
      description: 'Manages a specific team within the department, responsible for day-to-day operations and team performance',
      responsibilities: [
        'Manage team operations',
        'Assign tasks and monitor progress',
        'Provide coaching and feedback',
        'Implement department strategies',
        'Report on team performance'
      ],
      clientInteraction: 'Occasional client interaction for project updates and issue resolution',
      approvalAuthority: 'Can approve team-level decisions and resource allocation within budget',
      skills: ['Team leadership', 'Project management', 'Performance management', 'Problem-solving'],
      experience: '5-7 years',
      reporting: {
        reportsTo: ['Department Head'],
        directReports: ['Senior Specialist', 'Specialist']
      }
    },
    {
      id: 'project-manager',
      category: 'Leadership',
      name: 'Project Manager',
      description: 'Manages specific projects across teams, responsible for project planning, execution, and delivery',
      responsibilities: [
        'Project planning and scheduling',
        'Resource coordination',
        'Risk management',
        'Stakeholder communication',
        'Project reporting and documentation'
      ],
      clientInteraction: 'Regular client interaction for project updates and requirements gathering',
      approvalAuthority: 'Can approve project-specific decisions and changes within scope',
      skills: ['Project management', 'Risk management', 'Stakeholder management', 'Communication'],
      experience: '4-6 years',
      reporting: {
        reportsTo: ['Department Head', 'Team Manager'],
        directReports: ['Project team members']
      }
    },
    
    // Technical roles
    {
      id: 'senior-engineer',
      category: 'Technical',
      name: 'Senior Engineer',
      description: 'Experienced technical professional responsible for complex technical work and mentoring',
      responsibilities: [
        'Design and implement complex technical solutions',
        'Mentor junior engineers',
        'Participate in architecture decisions',
        'Code reviews and quality assurance',
        'Technical documentation'
      ],
      clientInteraction: 'Limited client interaction for technical requirements clarification',
      approvalAuthority: 'Can approve technical decisions and code changes',
      skills: ['Technical expertise', 'System design', 'Problem-solving', 'Mentoring', 'Documentation'],
      experience: '5-7 years',
      reporting: {
        reportsTo: ['Team Manager', 'Technical Lead'],
        directReports: ['Engineer', 'Junior Engineer']
      }
    },
    {
      id: 'engineer',
      category: 'Technical',
      name: 'Engineer',
      description: 'Technical professional responsible for implementing solutions and solving technical problems',
      responsibilities: [
        'Implement technical solutions',
        'Troubleshoot and fix issues',
        'Write tests and documentation',
        'Participate in code reviews',
        'Collaborate with team members'
      ],
      clientInteraction: 'Minimal client interaction',
      approvalAuthority: 'Can approve minor technical changes',
      skills: ['Technical skills', 'Problem-solving', 'Testing', 'Documentation'],
      experience: '2-4 years',
      reporting: {
        reportsTo: ['Senior Engineer', 'Team Manager'],
        directReports: ['Junior Engineer']
      }
    },
    {
      id: 'junior-engineer',
      category: 'Technical',
      name: 'Junior Engineer',
      description: 'Entry-level technical professional learning and growing in the role',
      responsibilities: [
        'Implement simple technical tasks',
        'Learn from senior team members',
        'Write tests and documentation',
        'Participate in code reviews',
        'Support team activities'
      ],
      clientInteraction: 'No client interaction',
      approvalAuthority: 'No approval authority',
      skills: ['Basic technical skills', 'Learning aptitude', 'Teamwork', 'Communication'],
      experience: '0-2 years',
      reporting: {
        reportsTo: ['Engineer', 'Senior Engineer'],
        directReports: []
      }
    },
    
    // Business roles
    {
      id: 'business-analyst',
      category: 'Business',
      name: 'Business Analyst',
      description: 'Analyzes business needs and translates them into requirements and solutions',
      responsibilities: [
        'Gather and document requirements',
        'Analyze business processes',
        'Create functional specifications',
        'Facilitate communication between business and technical teams',
        'Test and validate solutions'
      ],
      clientInteraction: 'Regular client interaction for requirements gathering and validation',
      approvalAuthority: 'Can approve requirements and functional specifications',
      skills: ['Requirements analysis', 'Business process modeling', 'Documentation', 'Communication'],
      experience: '3-5 years',
      reporting: {
        reportsTo: ['Team Manager', 'Project Manager'],
        directReports: []
      }
    },
    {
      id: 'product-owner',
      category: 'Business',
      name: 'Product Owner',
      description: 'Represents the business and user needs, responsible for product backlog and prioritization',
      responsibilities: [
        'Maintain product backlog',
        'Prioritize features and requirements',
        'Define acceptance criteria',
        'Collaborate with stakeholders',
        'Validate product increments'
      ],
      clientInteraction: 'Regular client interaction for product direction and feedback',
      approvalAuthority: 'Can approve product backlog, priorities, and acceptance criteria',
      skills: ['Product management', 'Stakeholder management', 'Prioritization', 'Communication'],
      experience: '4-6 years',
      reporting: {
        reportsTo: ['Department Head', 'Product Director'],
        directReports: ['Business Analyst']
      }
    },
    {
      id: 'account-manager',
      category: 'Business',
      name: 'Account Manager',
      description: 'Manages client relationships and ensures client satisfaction',
      responsibilities: [
        'Maintain client relationships',
        'Identify client needs and opportunities',
        'Coordinate service delivery',
        'Handle client issues and escalations',
        'Report on account performance'
      ],
      clientInteraction: 'Extensive client interaction as primary point of contact',
      approvalAuthority: 'Can approve account-specific decisions and service adjustments',
      skills: ['Relationship management', 'Communication', 'Problem-solving', 'Negotiation'],
      experience: '3-5 years',
      reporting: {
        reportsTo: ['Team Manager', 'Sales Director'],
        directReports: []
      }
    },
    
    // Creative roles
    {
      id: 'designer',
      category: 'Creative',
      name: 'Designer',
      description: 'Creates visual designs and user experiences for products and services',
      responsibilities: [
        'Create visual designs',
        'Design user interfaces and experiences',
        'Develop design systems and guidelines',
        'Collaborate with product and engineering teams',
        'Gather and incorporate feedback'
      ],
      clientInteraction: 'Occasional client interaction for design presentations and feedback',
      approvalAuthority: 'Can approve design decisions within established guidelines',
      skills: ['Visual design', 'UI/UX design', 'Design tools', 'Collaboration', 'Creativity'],
      experience: '3-5 years',
      reporting: {
        reportsTo: ['Design Lead', 'Team Manager'],
        directReports: []
      }
    },
    {
      id: 'content-creator',
      category: 'Creative',
      name: 'Content Creator',
      description: 'Creates written and visual content for various channels and purposes',
      responsibilities: [
        'Create written content',
        'Develop visual content',
        'Maintain content calendar',
        'Collaborate with marketing and product teams',
        'Measure content performance'
      ],
      clientInteraction: 'Limited client interaction for content requirements and approvals',
      approvalAuthority: 'Can approve content within established guidelines',
      skills: ['Writing', 'Editing', 'Content strategy', 'SEO', 'Analytics'],
      experience: '2-4 years',
      reporting: {
        reportsTo: ['Content Lead', 'Marketing Manager'],
        directReports: []
      }
    },
    {
      id: 'ux-researcher',
      category: 'Creative',
      name: 'UX Researcher',
      description: 'Conducts user research to inform product and design decisions',
      responsibilities: [
        'Plan and conduct user research',
        'Analyze research data',
        'Create user personas and journey maps',
        'Present research findings',
        'Collaborate with product and design teams'
      ],
      clientInteraction: 'Regular client interaction for research planning and participant recruitment',
      approvalAuthority: 'Can approve research plans and methodologies',
      skills: ['User research', 'Data analysis', 'Interviewing', 'Usability testing', 'Presentation'],
      experience: '3-5 years',
      reporting: {
        reportsTo: ['Design Lead', 'Product Owner'],
        directReports: []
      }
    },
    
    // Support roles
    {
      id: 'customer-support-specialist',
      category: 'Support',
      name: 'Customer Support Specialist',
      description: 'Provides support and assistance to customers, resolving issues and answering questions',
      responsibilities: [
        'Respond to customer inquiries',
        'Troubleshoot and resolve issues',
        'Document customer interactions',
        'Escalate complex issues',
        'Provide product information and guidance'
      ],
      clientInteraction: 'Extensive client interaction as primary support contact',
      approvalAuthority: 'Can approve standard support actions and minor accommodations',
      skills: ['Customer service', 'Problem-solving', 'Communication', 'Product knowledge', 'Patience'],
      experience: '1-3 years',
      reporting: {
        reportsTo: ['Support Lead', 'Team Manager'],
        directReports: []
      }
    },
    {
      id: 'technical-support-engineer',
      category: 'Support',
      name: 'Technical Support Engineer',
      description: 'Provides technical support for complex products and services',
      responsibilities: [
        'Troubleshoot technical issues',
        'Provide technical guidance',
        'Document technical solutions',
        'Collaborate with engineering teams',
        'Identify recurring issues for product improvement'
      ],
      clientInteraction: 'Regular client interaction for technical support',
      approvalAuthority: 'Can approve technical workarounds and solutions',
      skills: ['Technical troubleshooting', 'Problem-solving', 'Communication', 'Documentation', 'Customer service'],
      experience: '2-4 years',
      reporting: {
        reportsTo: ['Support Lead', 'Technical Lead'],
        directReports: []
      }
    },
    {
      id: 'implementation-specialist',
      category: 'Support',
      name: 'Implementation Specialist',
      description: 'Helps clients implement and adopt products and services',
      responsibilities: [
        'Plan and execute implementations',
        'Configure products for client needs',
        'Train client users',
        'Document implementation processes',
        'Provide post-implementation support'
      ],
      clientInteraction: 'Extensive client interaction throughout implementation process',
      approvalAuthority: 'Can approve implementation plans and configurations',
      skills: ['Project management', 'Technical configuration', 'Training', 'Communication', 'Problem-solving'],
      experience: '2-4 years',
      reporting: {
        reportsTo: ['Implementation Lead', 'Customer Success Manager'],
        directReports: []
      }
    }
  ];

  // Group templates by category
  const groupedTemplates: Record<string, typeof templates> = {};
  templates.forEach(template => {
    if (!groupedTemplates[template.category]) {
      groupedTemplates[template.category] = [];
    }
    groupedTemplates[template.category].push(template);
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Role Templates
      </Typography>
      
      <Typography variant="body1" paragraph>
        Select a pre-populated role template to quickly add roles to your departments.
        Each template includes standard responsibilities, skills, and reporting relationships that you can customize to fit your needs.
      </Typography>
      
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {category} Roles
          </Typography>
          
          <Grid container spacing={3}>
            {categoryTemplates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                  onClick={() => onSelectTemplate(template.id)}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {template.name}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {template.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon fontSize="small" sx={{ mr: 1 }} /> Key Responsibilities
                      </Typography>
                      <List dense>
                        {template.responsibilities.slice(0, 3).map((responsibility, index) => (
                          <ListItem key={index} disablePadding>
                            <ListItemText primary={responsibility} />
                          </ListItem>
                        ))}
                        {template.responsibilities.length > 3 && (
                          <ListItem disablePadding>
                            <ListItemText primary={`+${template.responsibilities.length - 3} more...`} />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Skills</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {template.skills.slice(0, 5).map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                        {template.skills.length > 5 && (
                          <Chip label={`+${template.skills.length - 5} more`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Experience</Typography>
                      <Typography variant="body2">{template.experience}</Typography>
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => onSelectTemplate(template.id)}
                      sx={{ mt: 1 }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default RoleTemplates;
