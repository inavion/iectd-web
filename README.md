# iEctD Web Application

A modern Next.js web application for iEctD, deployed on AWS Amplify with automatic CI/CD via GitHub Actions.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
iectd-web/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── layout.tsx
│   └── page.tsx
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── AuthForm.tsx
├── lib/                   # Utility functions
├── public/               # Static assets
├── infra/                # AWS CDK Infrastructure
│   ├── bin/
│   ├── lib/
│   └── README.md
└── .github/
    └── workflows/        # GitHub Actions
        └── deploy.yml
```

## 🏗️ Infrastructure & Deployment

### Architecture

```
GitHub (main branch) ──┬──→ GitHub Actions (CI: Lint, Test, Build)
                       │
                       └──→ AWS Amplify (CD: Deploy) → iectd.com
```

- **GitHub Actions**: Continuous Integration (CI) - runs linting, testing, and build validation
- **AWS Amplify**: Continuous Deployment (CD) - automatically deploys from connected GitHub repository

### AWS Services Used
- **AWS Amplify**: Hosting with SSR support
- **Route53**: DNS management for iectd.com
- **ACM**: SSL/TLS certificates
- **CloudFront**: CDN (managed by Amplify)

### Deployment Flow

1. **Push to `main` branch** triggers:
   - GitHub Actions: Runs CI checks (lint, test, build validation)
   - AWS Amplify: Automatically starts deployment from connected GitHub repo
2. **AWS Amplify**:
   - Pulls latest code from GitHub
   - Runs build process using `amplify.yml` configuration
   - Deploys to CloudFront/edge locations
3. **DNS** routes traffic to new deployment via Route53
4. **SSL** is automatically managed via ACM

## 🔧 Initial Setup Guide

### Step 1: Set Up AWS Infrastructure

```bash
# Navigate to infrastructure folder
cd infra

# Install CDK dependencies
npm install

# Bootstrap CDK (first time only)
npm run bootstrap

# Deploy infrastructure
npm run deploy
```

After deployment, note the **AmplifyAppId** from the output.

### Step 2: Connect GitHub Repository to Amplify (REQUIRED)

⚠️ **This step is required** - The CDK creates the Amplify app infrastructure but cannot automatically connect to GitHub due to OAuth requirements.

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app (iectd-web)
3. Go to **"App settings" → "General settings"**
4. In the **"Repository"** section, click **"Connect repository"**
5. Select **"GitHub"** and authorize AWS Amplify
6. Select your repository: **inavion/iectd-web**
7. Choose the **`main`** branch
8. Amplify will auto-detect your `amplify.yml` build configuration
9. Click **"Save and deploy"**

Once connected, Amplify will automatically deploy whenever you push to the `main` branch.

### Step 3: Configure GitHub Secrets (Optional)

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets if you need them for CI/CD:

| Secret Name | Description | Required? |
|-------------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | API endpoint URL | Optional - for build-time validation |

**Note:** AWS credentials are no longer needed in GitHub Actions since Amplify handles deployment directly from the connected GitHub repository.

### Step 4: Verify Domain Setup

1. Ensure Route53 hosted zone exists for `iectd.com`
2. Verify SSL certificate is validated in ACM
3. Check Amplify domain configuration

## 🔄 Continuous Integration & Deployment

### Automatic Deployments
- **Every push to `main`** triggers:
  - ✅ GitHub Actions: CI checks (lint, test, build validation)
  - ✅ AWS Amplify: Automatic deployment from connected GitHub repo
- **Pull Requests** trigger:
  - ✅ GitHub Actions: CI checks only
  - ✅ AWS Amplify: Optional preview deployments (if configured)

### Manual Deployment
```bash
# Trigger deployment via AWS Console
# Go to Amplify Console → Select branch → Click "Redeploy this version"

# Or via AWS CLI
aws amplify start-job \
  --app-id d2mc9m3dhjezb9 \
  --branch-name main \
  --job-type RELEASE \
  --region ap-southeast-1
```

**Note:** This only works after connecting GitHub to Amplify in Step 2.

## 🛠️ Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔐 Environment Variables

Create a `.env.local` file for local development:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.iectd.com

# Add other environment variables as needed
```

**Note:** Never commit `.env` files. Use GitHub Secrets for CI/CD.

## 📚 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod validation
- **Deployment**: AWS Amplify
- **Infrastructure**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions

## 🔗 Links

- **Production**: https://iectd.com
- **Amplify Console**: AWS Amplify Dashboard
- **GitHub Repository**: Your GitHub repo URL

## 📝 License

Private - All rights reserved.
