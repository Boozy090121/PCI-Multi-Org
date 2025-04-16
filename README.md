# Organizational Structure Management Application

A comprehensive web application for managing organizational structure, roles, responsibilities, and headcount planning.

## Features

- **Department & Role Management**: Create, edit, and organize departments and roles with detailed information
- **Cross-Departmental Alignment**: Visualize responsibilities across departments with RACI matrices
- **Headcount Calculation**: Calculate optimal staffing based on workload metrics
- **Organizational Chart**: Interactive visualization of your organization's structure
  - **Dynamic Hierarchy Visualization**
    - Drag-and-drop interface for restructuring
    - Multiple view options (vertical, horizontal, radial)
    - Expand/collapse functionality for departments
    - Role detail pop-ups on hover/click
    - Search functionality to locate specific roles
  - **Hierarchy Management**
    - Visual indication of reporting relationships
    - Span of control analysis
    - Management layers optimization
    - Dotted-line relationship indicators
  - **Export & Share Functions**
    - High-resolution PNG/PDF export
- **Gap Analysis**: Identify and track organizational gaps
- **Template Management**: Pre-populated department and role templates
- **Collaboration Tools**: Share and collaborate with team members

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Components**: Tailwind CSS with shadcn/ui
- **Visualization**: Recharts for charts and graphs
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/org-structure-app.git
cd org-structure-app
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Start the development server
```bash
npm run dev
# or
pnpm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application is configured for easy deployment to Vercel:

1. Install Vercel CLI
```bash
npm install -g vercel
```

2. Deploy to Vercel
```bash
vercel
```

3. For production deployment
```bash
vercel --prod
```

## Project Structure

- `/src/components` - Reusable UI components
  - `/departments` - Department management components
  - `/roles` - Role definition components
  - `/alignment` - Cross-departmental alignment tools
  - `/headcount` - Headcount calculation components
  - `/orgchart` - Organizational chart visualization
  - `/gap-analysis` - Gap analysis and implementation planning
  - `/common` - Common UI components

## License

This project is licensed under the MIT License - see the LICENSE file for details.
