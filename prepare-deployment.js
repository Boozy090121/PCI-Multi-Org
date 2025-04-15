#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const appName = 'org-structure-app';
const buildDir = path.join(__dirname, 'frontend', 'build');
const packageDir = path.join(__dirname, 'deployment');

// Create deployment directory if it doesn't exist
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
}

// Build the React application
console.log('Building React application...');
try {
  execSync('npm run build', { 
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit'
  });
  console.log('React build completed successfully.');
} catch (error) {
  console.error('Error building React application:', error);
  process.exit(1);
}

// Create Firebase configuration files
console.log('Creating Firebase configuration files...');

// firebase.json
const firebaseConfig = {
  "hosting": {
    "public": "frontend/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "404.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=3600"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
};

fs.writeFileSync(
  path.join(__dirname, 'firebase.json'),
  JSON.stringify(firebaseConfig, null, 2)
);

// firestore.rules
const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Link-based security - allow access if the document has the correct access token
    match /organizations/{organizationId} {
      allow read: if resource.data.viewToken == request.query.token || resource.data.editToken == request.query.token;
      allow write: if resource.data.editToken == request.query.token;
      
      match /departments/{departmentId} {
        allow read: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken == request.query.token || 
                     get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
        allow write: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
      }
      
      match /roles/{roleId} {
        allow read: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken == request.query.token || 
                     get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
        allow write: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
      }
      
      match /matrices/{matrixId} {
        allow read: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken == request.query.token || 
                     get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
        allow write: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
      }
      
      match /calculators/{calculatorId} {
        allow read: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken == request.query.token || 
                     get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
        allow write: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
      }
      
      match /charts/{chartId} {
        allow read: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken == request.query.token || 
                     get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
        allow write: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
      }
      
      match /implementations/{implementationId} {
        allow read: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken == request.query.token || 
                     get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
        allow write: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
      }
      
      match /activities/{activityId} {
        allow read: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken == request.query.token || 
                     get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
        allow write: if get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken == request.query.token;
      }
    }
  }
}`;

fs.writeFileSync(
  path.join(__dirname, 'firestore.rules'),
  firestoreRules
);

// firestore.indexes.json
const firestoreIndexes = {
  "indexes": [
    {
      "collectionGroup": "departments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "roles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "title", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matrices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "calculators",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "departmentId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "charts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "implementations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
};

fs.writeFileSync(
  path.join(__dirname, 'firestore.indexes.json'),
  JSON.stringify(firestoreIndexes, null, 2)
);

// storage.rules
const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /organizations/{organizationId}/{allPaths=**} {
      allow read: if request.auth == null && 
                   (request.query.token == get(/databases/$(database)/documents/organizations/$(organizationId)).data.viewToken || 
                    request.query.token == get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken);
      allow write: if request.auth == null && 
                    request.query.token == get(/databases/$(database)/documents/organizations/$(organizationId)).data.editToken;
    }
  }
}`;

fs.writeFileSync(
  path.join(__dirname, 'storage.rules'),
  storageRules
);

// Create .env file for Firebase configuration
const envContent = `REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID`;

fs.writeFileSync(
  path.join(__dirname, 'frontend', '.env'),
  envContent
);

// Create deployment package
console.log('Creating deployment package...');
try {
  // Copy build files to deployment directory
  execSync(`cp -r ${buildDir}/* ${packageDir}/`, { stdio: 'inherit' });
  
  // Copy Firebase configuration files to deployment directory
  execSync(`cp firebase.json firestore.rules firestore.indexes.json storage.rules ${packageDir}/`, { stdio: 'inherit' });
  
  // Create a README file for deployment
  const readmeContent = `# ${appName} Deployment Package

This package contains all the files needed to deploy the Organizational Structure Management Application.

## Deployment Instructions

1. Install Firebase CLI if you haven't already:
   \`\`\`
   npm install -g firebase-tools
   \`\`\`

2. Login to Firebase:
   \`\`\`
   firebase login
   \`\`\`

3. Initialize Firebase project (if not already initialized):
   \`\`\`
   firebase init
   \`\`\`
   
   Select the following options:
   - Hosting
   - Firestore
   - Storage
   
   Use existing Firebase project or create a new one.

4. Update Firebase configuration in \`.env\` file with your Firebase project details.

5. Deploy to Firebase:
   \`\`\`
   firebase deploy
   \`\`\`

## Application Features

- Department & Role Management
- Cross-Departmental Alignment Tools
- Headcount Calculation Engine
- Interactive Organizational Chart
- Gap Analysis & Implementation Planning
- Data Management & Collaboration
- Department Templates
- Security Implementation

## Security

This application uses link-based security with no authentication required. Access is controlled through secure tokens in the URL.

## Support

For any issues or questions, please contact the application administrator.
`;

  fs.writeFileSync(
    path.join(packageDir, 'README.md'),
    readmeContent
  );
  
  console.log('Deployment package created successfully.');
} catch (error) {
  console.error('Error creating deployment package:', error);
  process.exit(1);
}

// Create a zip file of the deployment package
console.log('Creating zip archive of deployment package...');
try {
  execSync(`cd ${__dirname} && zip -r ${appName}-deployment.zip deployment/`, { stdio: 'inherit' });
  console.log(`Deployment package zipped to ${appName}-deployment.zip`);
} catch (error) {
  console.error('Error creating zip archive:', error);
  process.exit(1);
}

console.log('Deployment preparation completed successfully!');
