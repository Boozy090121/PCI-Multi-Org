# Vercel Deployment Instructions for Organizational Structure Management Application

This document provides step-by-step instructions for deploying the Organizational Structure Management Application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. [Git](https://git-scm.com/downloads) installed on your local machine
3. [Node.js](https://nodejs.org/) (v16 or later) installed on your local machine

## Deployment Steps

### 1. Prepare Your Repository

You have two options:

#### Option A: Deploy from a Git Repository (Recommended)

1. Create a new repository on GitHub, GitLab, or Bitbucket
2. Push your project to the repository:
   ```bash
   cd /path/to/org-structure-app
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

#### Option B: Deploy from Local Files

If you prefer not to use a Git repository, you can deploy directly from your local files using the Vercel CLI:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

### 2. Deploy to Vercel

#### Option A: Deploy from Git Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure your project:
   - Framework Preset: Select "Other"
   - Root Directory: Leave as `.`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Click "Deploy"

#### Option B: Deploy from Local Files

1. Navigate to your project directory:
   ```bash
   cd /path/to/org-structure-app
   ```

2. Run the deployment command:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy: Yes
   - Link to existing project: No
   - Project name: org-structure-app (or your preferred name)
   - Framework preset: Other
   - Output directory: build
   - Override settings: No

### 3. Configure Environment Variables (If Needed)

If your application uses environment variables:

1. Go to your project in the Vercel Dashboard
2. Click on "Settings" > "Environment Variables"
3. Add any required environment variables
4. Click "Save"

### 4. Verify Deployment

1. Once deployment is complete, Vercel will provide a URL to access your application
2. Open the URL in your browser to verify that the application is working correctly
3. Test all features, especially:
   - Headcount Visualization Dashboard
   - Template Management System

### 5. Custom Domain (Optional)

To use a custom domain:

1. Go to your project in the Vercel Dashboard
2. Click on "Settings" > "Domains"
3. Add your domain and follow the instructions to configure DNS settings

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in the Vercel Dashboard
2. Ensure all dependencies are correctly listed in package.json
3. Verify that the build command and output directory are correctly configured
4. Check that the vercel.json file is properly configured

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying React Applications to Vercel](https://vercel.com/guides/deploying-react-with-vercel)
- [Custom Domains on Vercel](https://vercel.com/docs/concepts/projects/domains)

## Support

If you need further assistance, please contact the application administrator or refer to the Vercel support documentation.
