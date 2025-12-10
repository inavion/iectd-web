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
GitHub (main branch) → GitHub Actions → AWS Amplify → iectd.com
                           │
                           └── Lint & Build → Trigger Amplify Deploy
```

### AWS Services Used
- **AWS Amplify**: Hosting with SSR support
- **Route53**: DNS management for iectd.com
- **ACM**: SSL/TLS certificates
- **CloudFront**: CDN (managed by Amplify)

### Deployment Flow

1. **Push to `main` branch** triggers GitHub Actions
2. **Lint & Build** validation runs
3. **AWS Amplify deployment** is triggered
4. **DNS** routes traffic to new deployment
5. **SSL** is automatically managed

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

### Step 2: Connect GitHub Repository to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app (iectd-web)
3. Go to "Hosting environments"
4. Click "Connect branch" → Select "GitHub"
5. Authorize and select your repository
6. Choose the `main` branch
7. Save and deploy

### Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret access key |
| `AMPLIFY_APP_ID` | From CDK deployment output |
| `NEXT_PUBLIC_API_URL` | (Optional) API endpoint URL |

### Step 4: Verify Domain Setup

1. Ensure Route53 hosted zone exists for `iectd.com`
2. Verify SSL certificate is validated in ACM
3. Check Amplify domain configuration

## 🔄 Continuous Deployment

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- GitHub Actions runs lint and build checks
- On success, triggers Amplify deployment

### Manual Deployment
```bash
# Trigger deployment via GitHub Actions
gh workflow run deploy.yml

# Or via AWS CLI
aws amplify start-job --app-id YOUR_APP_ID --branch-name main --job-type RELEASE
```

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
