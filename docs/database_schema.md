# Firestore Database Schema for Organizational Structure Management Application

## Overview
This document defines the database schema for the Organizational Structure Management Application using Firebase Firestore. The schema is designed to support all the features specified in the requirements, including department and role management, cross-departmental alignment tools, headcount calculation, organizational charts, and implementation planning.

## Collections Structure

### 1. organizations
Top-level collection for organization data. While the current application supports a single organization, this structure allows for future multi-tenant support.

**Document ID**: `{organizationId}` (auto-generated)

**Fields**:
- `name`: String - Organization name
- `createdAt`: Timestamp - Creation timestamp
- `updatedAt`: Timestamp - Last update timestamp
- `settings`: Map - Organization settings
  - `defaultView`: String - Default org chart view (vertical, horizontal, radial)
  - `allowComments`: Boolean - Whether commenting is enabled
  - `showActivityLog`: Boolean - Whether to show activity log
  - `shareId`: String - Unique identifier for link-based sharing
  - `readOnlyShareId`: String - Unique identifier for read-only sharing

### 2. departments
Collection for department data.

**Document ID**: `{departmentId}` (auto-generated)

**Fields**:
- `name`: String - Department name
- `color`: String - Department color code (hex)
- `order`: Number - Display order for sorting
- `organizationId`: String - Reference to parent organization
- `createdAt`: Timestamp - Creation timestamp
- `updatedAt`: Timestamp - Last update timestamp

### 3. roles
Collection for role data.

**Document ID**: `{roleId}` (auto-generated)

**Fields**:
- `title`: String - Role title
- `level`: String - Role level (I, II, III, etc.)
- `departmentId`: String - Reference to parent department
- `organizationId`: String - Reference to parent organization
- `responsibilities`: Array - List of responsibility objects
  - `id`: String - Unique identifier
  - `description`: String - Responsibility description
  - `category`: String - Responsibility category
- `clientInteraction`: Map - Client interaction scope
  - `level`: String - Interaction level (None, Limited, Full)
  - `description`: String - Description of interaction scope
  - `limitations`: Array - List of limitations
- `approvalAuthorities`: Array - List of approval authority objects
  - `id`: String - Unique identifier
  - `documentType`: String - Type of document
  - `approvalLimit`: Number - Monetary approval limit
  - `description`: String - Description of authority
- `skills`: Array - List of required skills and qualifications
  - `id`: String - Unique identifier
  - `name`: String - Skill name
  - `level`: String - Required proficiency level
  - `essential`: Boolean - Whether the skill is essential
- `experience`: Map - Years of experience recommendations
  - `minimum`: Number - Minimum years required
  - `preferred`: Number - Preferred years
  - `description`: String - Additional context
- `reporting`: Map - Reporting relationships
  - `reportsTo`: Array - List of role IDs this role reports to
  - `directReports`: Array - List of role IDs that report to this role
  - `dottedLineReports`: Array - List of role IDs with dotted-line reporting
- `headcount`: Map - Headcount information
  - `current`: Number - Current headcount
  - `projected`: Number - Projected headcount
  - `justification`: String - Justification for headcount
- `versions`: Array - Array of previous versions
  - `timestamp`: Timestamp - Version timestamp
  - `data`: Map - Complete role data at that time
  - `changedBy`: String - User who made the change
- `createdAt`: Timestamp - Creation timestamp
- `updatedAt`: Timestamp - Last update timestamp

### 4. matrices
Collection for responsibility, RACI, and interaction matrices.

**Document ID**: `{matrixId}` (auto-generated)

**Fields**:
- `name`: String - Matrix name
- `type`: String - Matrix type (RACI, responsibility, interaction)
- `organizationId`: String - Reference to parent organization
- `data`: Map - Matrix data
  - `rows`: Array - List of row objects
    - `id`: String - Unique identifier
    - `label`: String - Row label (process, responsibility, etc.)
    - `description`: String - Additional description
  - `columns`: Array - List of column objects
    - `id`: String - Unique identifier
    - `roleId`: String - Reference to role
    - `departmentId`: String - Reference to department
  - `cells`: Array - List of cell objects
    - `rowId`: String - Reference to row
    - `columnId`: String - Reference to column
    - `value`: String - Cell value (R, A, C, I for RACI matrices)
    - `notes`: String - Additional notes
- `createdAt`: Timestamp - Creation timestamp
- `updatedAt`: Timestamp - Last update timestamp

### 5. calculators
Collection for headcount calculators.

**Document ID**: `{calculatorId}` (auto-generated)

**Fields**:
- `name`: String - Calculator name
- `organizationId`: String - Reference to parent organization
- `inputs`: Map - Calculator input variables
  - `workOrdersPerDay`: Number - Average work orders per day
  - `avgHandlingTime`: Number - Average handling time in minutes
  - `complaintVolume`: Number - Complaint volume
  - `complexityFactor`: Number - Complexity factor
  - `growthRate`: Number - Projected growth rate
  - `efficiencyFactor`: Number - Efficiency factor
  - `absencePercentage`: Number - Leave/absence percentage
  - `trainingTime`: Number - Training/onboarding time in days
  - `regulatoryOverhead`: Number - Regulatory overhead time percentage
- `results`: Map - Calculator results
  - `recommendedHeadcount`: Number - Recommended headcount
  - `departmentBreakdown`: Array - Breakdown by department
  - `timestamp`: Timestamp - Calculation timestamp
- `scenarios`: Array - List of scenario objects
  - `id`: String - Unique identifier
  - `name`: String - Scenario name
  - `inputs`: Map - Scenario-specific inputs
  - `results`: Map - Scenario-specific results
  - `timestamp`: Timestamp - Scenario timestamp
- `createdAt`: Timestamp - Creation timestamp
- `updatedAt`: Timestamp - Last update timestamp

### 6. charts
Collection for organizational charts.

**Document ID**: `{chartId}` (auto-generated)

**Fields**:
- `name`: String - Chart name
- `type`: String - Chart type (vertical, horizontal, radial)
- `organizationId`: String - Reference to parent organization
- `data`: Map - Chart data
  - `nodes`: Array - List of node objects
    - `id`: String - Unique identifier
    - `roleId`: String - Reference to role (optional)
    - `departmentId`: String - Reference to department (optional)
    - `label`: String - Node label
    - `type`: String - Node type (role, department, custom)
    - `position`: Map - Position coordinates
      - `x`: Number - X coordinate
      - `y`: Number - Y coordinate
  - `edges`: Array - List of edge objects
    - `id`: String - Unique identifier
    - `source`: String - Source node ID
    - `target`: String - Target node ID
    - `type`: String - Edge type (direct, dotted)
- `createdAt`: Timestamp - Creation timestamp
- `updatedAt`: Timestamp - Last update timestamp

### 7. implementations
Collection for implementation plans.

**Document ID**: `{implementationId}` (auto-generated)

**Fields**:
- `name`: String - Implementation plan name
- `organizationId`: String - Reference to parent organization
- `phases`: Array - List of phase objects
  - `id`: String - Unique identifier
  - `name`: String - Phase name
  - `startDate`: Timestamp - Phase start date
  - `endDate`: Timestamp - Phase end date
  - `description`: String - Phase description
  - `status`: String - Phase status (Not Started, In Progress, Completed)
- `milestones`: Array - List of milestone objects
  - `id`: String - Unique identifier
  - `name`: String - Milestone name
  - `phaseId`: String - Reference to parent phase
  - `date`: Timestamp - Milestone date
  - `description`: String - Milestone description
  - `status`: String - Milestone status (Not Started, In Progress, Completed)
- `gaps`: Array - List of gap objects
  - `id`: String - Unique identifier
  - `type`: String - Gap type (department, role, skill, headcount)
  - `description`: String - Gap description
  - `impact`: String - Impact assessment
  - `resolution`: String - Resolution plan
  - `status`: String - Gap status (Identified, In Progress, Resolved)
- `createdAt`: Timestamp - Creation timestamp
- `updatedAt`: Timestamp - Last update timestamp

### 8. activities
Collection for activity logs.

**Document ID**: `{activityId}` (auto-generated)

**Fields**:
- `type`: String - Activity type (create, update, delete, comment)
- `entityType`: String - Entity type (department, role, matrix, calculator, chart, implementation)
- `entityId`: String - Reference to entity
- `organizationId`: String - Reference to parent organization
- `user`: String - User identifier
- `description`: String - Activity description
- `timestamp`: Timestamp - Activity timestamp
- `changes`: Map - Changes made (for update activities)
  - `before`: Map - State before change
  - `after`: Map - State after change

## Relationships

### One-to-Many Relationships
1. Organization to Departments: One organization has many departments
   - Implemented via `organizationId` field in departments collection

2. Organization to Roles: One organization has many roles
   - Implemented via `organizationId` field in roles collection

3. Department to Roles: One department has many roles
   - Implemented via `departmentId` field in roles collection

4. Organization to Matrices: One organization has many matrices
   - Implemented via `organizationId` field in matrices collection

5. Organization to Calculators: One organization has many calculators
   - Implemented via `organizationId` field in calculators collection

6. Organization to Charts: One organization has many charts
   - Implemented via `organizationId` field in charts collection

7. Organization to Implementations: One organization has many implementation plans
   - Implemented via `organizationId` field in implementations collection

8. Organization to Activities: One organization has many activities
   - Implemented via `organizationId` field in activities collection

### Many-to-Many Relationships
1. Roles to Roles (Reporting Relationships): Roles can report to multiple roles, and roles can have multiple direct reports
   - Implemented via `reporting.reportsTo` and `reporting.directReports` arrays in roles collection

2. Roles to Matrices: Roles can be part of multiple matrices, and matrices can include multiple roles
   - Implemented via `columns.roleId` in matrices collection

3. Departments to Matrices: Departments can be part of multiple matrices, and matrices can include multiple departments
   - Implemented via `columns.departmentId` in matrices collection

## Indexing Strategy

### Single-Field Indexes
1. `departments.organizationId` - For querying departments by organization
2. `departments.order` - For sorting departments by order
3. `roles.departmentId` - For querying roles by department
4. `roles.organizationId` - For querying roles by organization
5. `matrices.organizationId` - For querying matrices by organization
6. `matrices.type` - For querying matrices by type
7. `calculators.organizationId` - For querying calculators by organization
8. `charts.organizationId` - For querying charts by organization
9. `implementations.organizationId` - For querying implementations by organization
10. `activities.organizationId` - For querying activities by organization
11. `activities.timestamp` - For sorting activities by timestamp

### Composite Indexes
1. `roles.departmentId, roles.title` - For querying and sorting roles by department and title
2. `matrices.organizationId, matrices.type` - For querying matrices by organization and type
3. `activities.organizationId, activities.timestamp` - For querying and sorting activities by organization and timestamp
4. `activities.entityType, activities.entityId` - For querying activities by entity type and ID

## Security Rules
The following security rules will be implemented to protect the data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Link-based security
    function hasValidShareId(organizationId, shareId) {
      return get(/databases/$(database)/documents/organizations/$(organizationId)).data.shareId == shareId;
    }
    
    function hasValidReadOnlyShareId(organizationId, shareId) {
      return get(/databases/$(database)/documents/organizations/$(organizationId)).data.readOnlyShareId == shareId;
    }
    
    // Organization rules
    match /organizations/{organizationId} {
      allow read: if hasValidShareId(organizationId, request.auth.token.shareId) || 
                    hasValidReadOnlyShareId(organizationId, request.auth.token.shareId);
      allow write: if hasValidShareId(organizationId, request.auth.token.shareId);
      
      // Department rules
      match /departments/{departmentId} {
        allow read: if hasValidShareId(organizationId, request.auth.token.shareId) || 
                      hasValidReadOnlyShareId(organizationId, request.auth.token.shareId);
        allow write: if hasValidShareId(organizationId, request.auth.token.shareId);
      }
    }
    
    // Role rules
    match /roles/{roleId} {
      allow read: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId) || 
                    hasValidReadOnlyShareId(resource.data.organizationId, request.auth.token.shareId);
      allow write: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId);
    }
    
    // Matrix rules
    match /matrices/{matrixId} {
      allow read: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId) || 
                    hasValidReadOnlyShareId(resource.data.organizationId, request.auth.token.shareId);
      allow write: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId);
    }
    
    // Calculator rules
    match /calculators/{calculatorId} {
      allow read: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId) || 
                    hasValidReadOnlyShareId(resource.data.organizationId, request.auth.token.shareId);
      allow write: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId);
    }
    
    // Chart rules
    match /charts/{chartId} {
      allow read: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId) || 
                    hasValidReadOnlyShareId(resource.data.organizationId, request.auth.token.shareId);
      allow write: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId);
    }
    
    // Implementation rules
    match /implementations/{implementationId} {
      allow read: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId) || 
                    hasValidReadOnlyShareId(resource.data.organizationId, request.auth.token.shareId);
      allow write: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId);
    }
    
    // Activity rules
    match /activities/{activityId} {
      allow read: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId) || 
                    hasValidReadOnlyShareId(resource.data.organizationId, request.auth.token.shareId);
      allow create: if hasValidShareId(resource.data.organizationId, request.auth.token.shareId);
      allow update, delete: if false; // Activities should never be updated or deleted
    }
  }
}
```

## Data Migration Strategy
For initial data population and future migrations, the following strategy will be used:

1. **Initial Data Population**:
   - Pre-populated department templates will be stored in a JSON file
   - On application initialization, check if departments exist
   - If no departments exist, import the templates from the JSON file

2. **Schema Migrations**:
   - Version the schema in the organization document
   - When schema changes are needed, create a migration function
   - Run migrations when the application detects a schema version mismatch

3. **Data Backup**:
   - Schedule regular exports of Firestore data
   - Store backups in Firebase Storage with appropriate retention policy
   - Implement a restore function for disaster recovery

## Conclusion
This database schema provides a comprehensive foundation for the Organizational Structure Management Application. It supports all the required features while maintaining flexibility for future enhancements. The schema is designed with performance, security, and scalability in mind, following Firestore best practices for document-based NoSQL databases.
