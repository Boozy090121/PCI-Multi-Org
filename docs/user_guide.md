# Organizational Structure Management Application - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Department & Role Management](#department--role-management)
4. [Cross-Departmental Alignment Tools](#cross-departmental-alignment-tools)
5. [Headcount Calculation Engine](#headcount-calculation-engine)
6. [Interactive Organizational Chart](#interactive-organizational-chart)
7. [Gap Analysis & Implementation Planning](#gap-analysis--implementation-planning)
8. [Data Management & Collaboration](#data-management--collaboration)
9. [Department Templates](#department-templates)
10. [Security Features](#security-features)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)

## Introduction

The Organizational Structure Management Application is a comprehensive web-based tool designed to help organizations manage their structure, roles, responsibilities, and headcount planning. This application enables collaborative reorganization planning, role definition, responsibility alignment, headcount calculation, and organizational visualization.

### Key Features

- **Department & Role Management**: Create, edit, and organize departments and roles
- **Cross-Departmental Alignment**: Visualize responsibilities across departments
- **Headcount Calculation**: Calculate optimal staffing levels based on metrics
- **Interactive Organizational Chart**: Visualize your organization's structure
- **Gap Analysis & Implementation Planning**: Identify gaps and plan implementation
- **Data Management & Collaboration**: Share and collaborate with team members
- **Department Templates**: Use pre-populated templates for quick setup
- **Security Features**: Link-based access control without authentication

## Getting Started

### First-Time Access

1. When you first access the application, you'll be presented with an onboarding tour
2. Follow the guided tour to learn about the main features
3. You can skip the tour by clicking "Skip Tour" if you prefer to explore on your own

### Navigation

The application is organized into several main sections, accessible from the navigation menu:

- **Departments & Roles**: Manage your organizational structure
- **Alignment**: View and edit cross-departmental matrices
- **Headcount**: Calculate and plan staffing levels
- **Org Chart**: Visualize your organization
- **Gap Analysis**: Identify and address organizational gaps
- **Implementation**: Plan and track reorganization implementation
- **Data Management**: Import, export, and manage your data
- **Settings**: Configure application settings and security

## Department & Role Management

### Department Editor

The Department Editor allows you to create and manage departments within your organization.

#### Creating a Department

1. Navigate to the "Departments & Roles" section
2. Click "Add Department"
3. Enter the department name, description, and select a color
4. Click "Save Department"

#### Editing a Department

1. Select the department you want to edit from the department list
2. Click "Edit Department"
3. Update the department details
4. Click "Save Department"

#### Deleting a Department

1. Select the department you want to delete
2. Click "Delete Department"
3. Confirm the deletion

#### Reordering Departments

1. Drag and drop departments in the list to change their order
2. The new order will be automatically saved

### Role Definition System

The Role Definition System allows you to create and manage roles within departments.

#### Creating a Role

1. Select a department
2. Click "Add Role"
3. Fill in the role details:
   - Title (with level indicators I, II, III, etc.)
   - Detailed responsibilities
   - Client interaction scope
   - Document approval authorities
   - Required skills and qualifications
   - Years of experience
   - Reporting relationships
   - Current and projected headcount
4. Click "Save Role"

#### Editing a Role

1. Select the role you want to edit
2. Click "Edit Role"
3. Update the role details
4. Click "Save Role"

#### Cloning a Role

1. Select the role you want to clone
2. Click "Clone Role"
3. Modify the details of the cloned role
4. Click "Save Role"

#### Comparing Roles

1. Select a role
2. Click "Compare"
3. Select another role to compare with
4. View the side-by-side comparison of both roles

## Cross-Departmental Alignment Tools

### Responsibility Matrix

The Responsibility Matrix shows how responsibilities are distributed across departments and roles.

#### Creating a Matrix

1. Navigate to the "Alignment" section
2. Click "Create Matrix"
3. Enter a name for the matrix
4. Select the matrix type (Standard, RACI)
5. Click "Save Matrix"

#### Editing a Matrix

1. Select the matrix you want to edit
2. Click "Edit Matrix"
3. Click on cells to assign responsibilities
4. For RACI matrices, select R, A, C, or I for each cell
5. Click "Save Matrix"

#### Filtering the Matrix

1. Use the department filter to show only specific departments
2. Use the responsibility filter to show only specific types of responsibilities
3. Use the search box to find specific roles or responsibilities

#### Exporting the Matrix

1. Click "Export"
2. Select the export format (Excel, PDF, CSV)
3. Save the exported file

### Interaction Map

The Interaction Map visualizes how roles interact across departments.

1. Navigate to the "Alignment" section
2. Select "Interaction Map"
3. View the visualization of role interactions
4. Use the filters to focus on specific departments or interaction types

## Headcount Calculation Engine

### Metrics-Based Calculator

The Metrics-Based Calculator helps you determine optimal staffing levels based on workload metrics.

#### Creating a Calculator

1. Navigate to the "Headcount" section
2. Click "Create Calculator"
3. Enter a name for the calculator
4. Select the department
5. Enter the workload parameters:
   - Work orders
   - Handling time
   - Complaint volume
   - Complexity
6. Enter the organizational factors:
   - Growth rate
   - Efficiency
   - Absence rate
   - Training overhead
   - Regulatory overhead
7. Click "Calculate"

#### Viewing Results

1. View the calculated headcount results
2. See the breakdown by department
3. Compare current vs. projected headcount

#### Scenario Simulation

1. Click "Create Scenario"
2. Adjust the parameters for your scenario
3. View the simulated headcount results
4. Compare multiple scenarios side by side

## Interactive Organizational Chart

### Creating a Chart

1. Navigate to the "Org Chart" section
2. Click "Create Chart"
3. Enter a name for the chart
4. Configure the chart options:
   - Layout direction (vertical/horizontal)
   - Show/hide headcount
   - Show/hide vacancies
   - Color coding options
5. Click "Save Chart"

### Interacting with the Chart

1. Zoom in/out using the zoom controls or mouse wheel
2. Click on departments or roles to see details
3. Drag nodes to rearrange the chart (changes are visual only)
4. Use the "Fit to View" button to see the entire chart

### Exporting the Chart

1. Click "Export"
2. Select the export format (PNG, PDF, SVG)
3. Configure export options (size, quality)
4. Save the exported file

## Gap Analysis & Implementation Planning

### Gap Identification

1. Navigate to the "Gap Analysis" section
2. Click "Identify Gaps"
3. The system will analyze your organization for:
   - Headcount gaps (understaffed roles)
   - Skills gaps (missing competencies)
   - Responsibility gaps (overlaps and gaps)
   - Reporting relationship issues
4. View the identified gaps with severity ratings

### Implementation Planning

1. Navigate to the "Implementation" section
2. Click "Create Implementation Plan"
3. Enter a name for the plan
4. Add tasks to address identified gaps:
   - Task name
   - Description
   - Assigned to
   - Due date
   - Status
5. Click "Save Plan"

### Tracking Progress

1. Select an implementation plan
2. Update task statuses as they progress
3. View the overall completion percentage
4. Add comments or notes to tasks

## Data Management & Collaboration

### Sharing Access

1. Navigate to the "Data Management" section
2. Click "Share"
3. Choose the access level:
   - Edit access (can make changes)
   - View-only access (can only view)
4. Copy the generated link
5. Share the link with team members

### Import/Export Data

#### Importing Data

1. Click "Import"
2. Select the import format (JSON, CSV, Excel)
3. Upload your file
4. Map the columns to the application fields
5. Click "Import Data"

#### Exporting Data

1. Click "Export"
2. Select the export format (JSON, CSV, Excel, PDF)
3. Choose what to export (departments, roles, matrices, etc.)
4. Click "Export Data"
5. Save the exported file

### Backup and Restore

1. Click "Backup"
2. The system will create a complete backup of your data
3. Download the backup file
4. To restore, click "Restore" and upload a backup file

## Department Templates

### Using Templates

1. Navigate to the "Departments & Roles" section
2. Click "Use Template"
3. Browse the available templates:
   - Executive Leadership
   - Human Resources
   - Engineering
   - Marketing
   - Finance
   - Operations
   - Product
   - Sales
   - Customer Success
   - Legal
4. Select a template
5. Customize the template as needed
6. Click "Apply Template"

### Role Templates

1. Select a department
2. Click "Add Role from Template"
3. Browse the available role templates:
   - Leadership roles
   - Technical roles
   - Business roles
   - Creative roles
   - Support roles
4. Select a template
5. Customize the role as needed
6. Click "Save Role"

## Security Features

### Link-Based Security

The application uses link-based security instead of traditional authentication:

1. When you create an organization, two links are generated:
   - Edit access link (allows full editing)
   - View-only link (allows viewing only)
2. Share these links with appropriate team members
3. Anyone with the link can access the application
4. No login or account creation required

### Security Settings

1. Navigate to the "Settings" section
2. Click "Security"
3. Configure security options:
   - Link expiration
   - Password protection
   - IP restrictions
   - Custom URL
4. Click "Save Settings"

### Regenerating Links

1. Navigate to the "Settings" section
2. Click "Security"
3. Click "Regenerate Links"
4. New links will be generated (old links will no longer work)
5. Share the new links with team members

## Deployment Guide

### Prerequisites

- Firebase account (free tier is sufficient to start)
- Node.js and npm installed on your computer

### Deployment Steps

1. Extract the deployment package (`org-structure-app-deployment.zip`)
2. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

3. Login to Firebase:
   ```
   firebase login
   ```

4. Initialize Firebase project (if not already initialized):
   ```
   firebase init
   ```
   
   Select the following options:
   - Hosting
   - Firestore
   - Storage
   
   Use existing Firebase project or create a new one.

5. Update Firebase configuration in `.env` file with your Firebase project details:
   ```
   REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
   REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
   REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
   REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
   REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
   ```

6. Deploy to Firebase:
   ```
   firebase deploy
   ```

7. After deployment, Firebase will provide a URL where your application is hosted

### Post-Deployment

1. Access your application using the provided URL
2. Create your organization structure
3. Share the access links with your team members

## Troubleshooting

### Common Issues

#### Application Not Loading

1. Check your internet connection
2. Clear your browser cache
3. Try a different browser
4. Ensure Firebase services are running

#### Data Not Saving

1. Check your internet connection
2. Ensure you're using the edit access link, not the view-only link
3. Try refreshing the page
4. Check Firebase console for any service disruptions

#### Performance Issues

1. Reduce the amount of data displayed by using filters
2. Enable pagination for large datasets
3. Close unused browser tabs
4. Check your internet connection speed

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the Firebase status page for service disruptions
2. Review Firebase documentation for specific error messages
3. Contact your application administrator

---

This user guide covers the main features and functionality of the Organizational Structure Management Application. For more detailed information on specific features, refer to the in-app help tooltips and contextual guidance.
