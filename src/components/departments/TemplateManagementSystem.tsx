import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Types for our templates
interface DepartmentTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  roleCount: number;
  category: string;
  popular: boolean;
}

interface RoleTemplate {
  id: string;
  title: string;
  level: string;
  department: string;
  responsibilities: string[];
  clientInteraction: string;
  approvalAuthorities: string[];
  requiredSkills: string[];
  experience: string;
  reporting: {
    reportsTo: string;
    manages: string[];
  };
  category: string;
  popular: boolean;
}

// Sample data - in a real app this would come from props or context
const sampleDepartmentTemplates: DepartmentTemplate[] = [
  {
    id: "dept-1",
    name: "Engineering",
    description: "Technical development and infrastructure management",
    color: "#4285F4",
    roleCount: 8,
    category: "Technical",
    popular: true
  },
  {
    id: "dept-2",
    name: "Product",
    description: "Product management and roadmap planning",
    color: "#EA4335",
    roleCount: 5,
    category: "Business",
    popular: true
  },
  {
    id: "dept-3",
    name: "Marketing",
    description: "Brand management and customer acquisition",
    color: "#FBBC05",
    roleCount: 6,
    category: "Business",
    popular: true
  },
  {
    id: "dept-4",
    name: "Sales",
    description: "Revenue generation and client relationships",
    color: "#34A853",
    roleCount: 4,
    category: "Business",
    popular: true
  },
  {
    id: "dept-5",
    name: "Customer Success",
    description: "Customer support and relationship management",
    color: "#8F44AD",
    roleCount: 5,
    category: "Support",
    popular: false
  },
  {
    id: "dept-6",
    name: "Finance",
    description: "Financial planning and accounting",
    color: "#3498DB",
    roleCount: 6,
    category: "Administrative",
    popular: false
  },
  {
    id: "dept-7",
    name: "Human Resources",
    description: "Talent acquisition and employee management",
    color: "#E67E22",
    roleCount: 4,
    category: "Administrative",
    popular: false
  },
  {
    id: "dept-8",
    name: "Legal",
    description: "Legal compliance and contract management",
    color: "#1ABC9C",
    roleCount: 3,
    category: "Administrative",
    popular: false
  },
  {
    id: "dept-9",
    name: "Operations",
    description: "Business operations and process management",
    color: "#9B59B6",
    roleCount: 5,
    category: "Administrative",
    popular: false
  },
  {
    id: "dept-10",
    name: "Research & Development",
    description: "Innovation and new product development",
    color: "#F1C40F",
    roleCount: 7,
    category: "Technical",
    popular: false
  }
];

const sampleRoleTemplates: RoleTemplate[] = [
  {
    id: "role-1",
    title: "Software Engineer",
    level: "II",
    department: "Engineering",
    responsibilities: [
      "Develop and maintain software applications",
      "Write clean, efficient, and well-documented code",
      "Participate in code reviews and testing",
      "Troubleshoot and debug issues"
    ],
    clientInteraction: "Limited to technical discussions with client engineers",
    approvalAuthorities: [
      "Code commits to development branches",
      "Technical documentation updates"
    ],
    requiredSkills: [
      "JavaScript/TypeScript",
      "React",
      "Node.js",
      "SQL/NoSQL databases",
      "Git"
    ],
    experience: "2-4 years",
    reporting: {
      reportsTo: "Engineering Manager",
      manages: []
    },
    category: "Technical",
    popular: true
  },
  {
    id: "role-2",
    title: "Product Manager",
    level: "III",
    department: "Product",
    responsibilities: [
      "Define product vision and strategy",
      "Create and maintain product roadmap",
      "Gather and prioritize requirements",
      "Work with engineering to deliver features",
      "Analyze market trends and competition"
    ],
    clientInteraction: "Regular client meetings and requirement gathering",
    approvalAuthorities: [
      "Product requirements documents",
      "Feature prioritization",
      "Release planning"
    ],
    requiredSkills: [
      "Product management",
      "Market analysis",
      "User experience design",
      "Agile methodologies",
      "Data analysis"
    ],
    experience: "5-7 years",
    reporting: {
      reportsTo: "Director of Product",
      manages: ["Associate Product Manager"]
    },
    category: "Business",
    popular: true
  },
  {
    id: "role-3",
    title: "Marketing Manager",
    level: "II",
    department: "Marketing",
    responsibilities: [
      "Develop and execute marketing campaigns",
      "Manage brand identity and messaging",
      "Create content for various channels",
      "Analyze campaign performance",
      "Coordinate with sales team"
    ],
    clientInteraction: "Limited to marketing collaborations",
    approvalAuthorities: [
      "Marketing materials",
      "Campaign budgets up to $10,000",
      "Social media content"
    ],
    requiredSkills: [
      "Digital marketing",
      "Content creation",
      "Social media management",
      "Analytics",
      "Brand management"
    ],
    experience: "3-5 years",
    reporting: {
      reportsTo: "Director of Marketing",
      manages: ["Marketing Coordinator"]
    },
    category: "Business",
    popular: true
  },
  {
    id: "role-4",
    title: "Customer Support Specialist",
    level: "I",
    department: "Customer Success",
    responsibilities: [
      "Respond to customer inquiries",
      "Troubleshoot and resolve issues",
      "Document customer feedback",
      "Escalate complex problems",
      "Maintain knowledge base"
    ],
    clientInteraction: "Direct customer support via multiple channels",
    approvalAuthorities: [
      "Basic support resolutions",
      "Knowledge base articles"
    ],
    requiredSkills: [
      "Customer service",
      "Problem-solving",
      "Communication",
      "Technical aptitude",
      "Patience and empathy"
    ],
    experience: "1-2 years",
    reporting: {
      reportsTo: "Customer Support Team Lead",
      manages: []
    },
    category: "Support",
    popular: false
  },
  {
    id: "role-5",
    title: "Engineering Manager",
    level: "IV",
    department: "Engineering",
    responsibilities: [
      "Lead and mentor engineering team",
      "Plan and execute technical projects",
      "Manage resource allocation",
      "Conduct performance reviews",
      "Collaborate with product and design teams"
    ],
    clientInteraction: "Escalation point for technical issues",
    approvalAuthorities: [
      "Technical architecture decisions",
      "Code release approvals",
      "Engineering hiring decisions",
      "Technical budget up to $50,000"
    ],
    requiredSkills: [
      "Software development",
      "Team leadership",
      "Project management",
      "Technical architecture",
      "Performance management"
    ],
    experience: "7-10 years",
    reporting: {
      reportsTo: "CTO",
      manages: ["Senior Software Engineer", "Software Engineer", "Junior Software Engineer"]
    },
    category: "Leadership",
    popular: true
  }
];

// Main component
const TemplateManagementSystem: React.FC = () => {
  // State for category filter and search term
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Filter department templates based on search and category
  const filteredDepartmentTemplates = sampleDepartmentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Filter role templates based on search and category
  const filteredRoleTemplates = sampleRoleTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         template.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories for filtering
  const departmentCategories = Array.from(new Set(sampleDepartmentTemplates.map(dept => dept.category)));
  const roleCategories = Array.from(new Set(sampleRoleTemplates.map(role => role.category)));
  const allCategories = Array.from(new Set([...departmentCategories, ...roleCategories]));
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <Tabs defaultValue="departments" onValueChange={setActiveTab}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Template Management System</h2>
            <Button variant="outline">Import Templates</Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="departments">Department Templates</TabsTrigger>
            <TabsTrigger value="roles">Role Templates</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="departments" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartmentTemplates.map(template => (
              <Card key={template.id} className="overflow-hidden">
                <div 
                  className="h-2" 
                  style={{ backgroundColor: template.color }}
                ></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{template.name}</CardTitle>
                    {template.popular && (
                      <Badge variant="secondary">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Roles: {template.roleCount}</span>
                    <span className="text-gray-500">Category: {template.category}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm">Preview</Button>
                  <Button size="sm">Use Template</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredDepartmentTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No department templates found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="roles" className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRoleTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.title} {template.level}</CardTitle>
                      <CardDescription>Department: {template.department}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {template.popular && (
                        <Badge variant="secondary">Popular</Badge>
                      )}
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Responsibilities:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {template.responsibilities.slice(0, 3).map((resp, index) => (
                          <li key={index}>{resp}</li>
                        ))}
                        {template.responsibilities.length > 3 && (
                          <li className="text-blue-600">+{template.responsibilities.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Required Skills:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.requiredSkills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">{skill}</Badge>
                          ))}
                          {template.requiredSkills.length > 3 && (
                            <Badge variant="outline" className="bg-gray-50">+{template.requiredSkills.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Experience:</h4>
                        <p className="text-gray-600">{template.experience}</p>
                        <h4 className="font-medium text-gray-700 mb-1 mt-2">Reports To:</h4>
                        <p className="text-gray-600">{template.reporting.reportsTo}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm">Use Template</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredRoleTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No role templates found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="p-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">Template Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Create Custom Template</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Create a new template from scratch with custom fields and settings.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Create New</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Import Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Import templates from CSV, Excel, or JSON files.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Import</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Export Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Export your templates for backup or sharing.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Export</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateManagementSystem;
