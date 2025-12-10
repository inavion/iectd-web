# iEctD Web Infrastructure

AWS CDK Infrastructure for deploying iEctD Web Application to AWS Amplify with custom domain (iectd.com).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Route 53                             │
│                   (iectd.com DNS)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   AWS Amplify                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CloudFront CDN                         │   │
│  │         (SSL/TLS via ACM Certificate)               │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│  ┌─────────────────────▼───────────────────────────────┐   │
│  │            Next.js SSR Compute                      │   │
│  │         (Automatic Scaling)                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Node.js** 20.x or later
3. **AWS CDK CLI** installed globally:
   ```bash
   npm install -g aws-cdk
   ```

## Setup

1. **Install dependencies:**
   ```bash
   cd infra
   npm install
   ```

2. **Bootstrap CDK** (first time only, per AWS account/region):
   ```bash
   npm run bootstrap
   ```

3. **Configure AWS credentials:**
   ```bash
   export AWS_ACCESS_KEY_ID=your-key-id
   export AWS_SECRET_ACCESS_KEY=your-access-secret
   export AWS_REGION=ap-southeast-1
   ```

## Deployment

### Preview changes:
```bash
npm run diff
```

### Deploy all stacks:
```bash
npm run deploy
```

### Deploy with specific environment:
```bash
npm run deploy:prod
```

### Destroy infrastructure:
```bash
npm run destroy
```

## Stacks

### 1. DNS Stack (`iectd-web-dns-production`)
- Route53 Hosted Zone lookup for iectd.com
- SSL Certificate (ACM) with DNS validation
- Supports: iectd.com, *.iectd.com, www.iectd.com

### 2. Amplify Stack (`iectd-web-amplify-production`)
- AWS Amplify App configured for Next.js SSR
- Main branch with auto-build enabled
- Custom domain configuration
- IAM role with necessary permissions

## Outputs

After deployment, you'll get:
- **AmplifyAppId**: Add this to GitHub Secrets as `AMPLIFY_APP_ID`
- **AmplifyDefaultDomain**: Temporary Amplify domain
- **ProductionUrl**: https://iectd.com
- **AmplifyConsoleUrl**: Direct link to AWS Amplify Console

## GitHub Secrets Required

After running CDK deploy, add these secrets to your GitHub repository:

| Secret Name | Description | How to get |
|-------------|-------------|------------|
| `AWS_ACCESS_KEY_ID` | IAM Access Key ID | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Access Key | AWS IAM Console |
| `AMPLIFY_APP_ID` | Amplify App ID | CDK Output or Amplify Console |

## Connecting GitHub Repository

After CDK deployment, connect your GitHub repository to Amplify:

1. Go to AWS Amplify Console (use the URL from CDK output)
2. Click on your app
3. Go to "Hosting environments"
4. Click "Connect branch"
5. Select "GitHub" and authorize
6. Select your repository and `main` branch
7. Save and deploy

## Domain Setup

The CDK will:
1. Look up existing Route53 hosted zone for iectd.com
2. Create SSL certificate with DNS validation
3. Configure Amplify custom domain

**Note:** DNS propagation may take up to 48 hours for new domains.

## Troubleshooting

### Certificate Validation Pending
If certificate shows "Pending validation":
1. Go to ACM Console
2. Check the CNAME records needed
3. Verify they exist in Route53

### Domain Not Connecting
1. Verify Route53 hosted zone nameservers match domain registrar
2. Wait for DNS propagation (up to 48 hours)
3. Check Amplify Console for specific errors

### Build Failures
1. Check Amplify Console build logs
2. Verify Node.js version (should be 20.x)
3. Test build locally: `npm run build`

