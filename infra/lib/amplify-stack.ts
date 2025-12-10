import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface AmplifyStackProps extends cdk.StackProps {
  domainName: string;
  appName: string;
  environment: string;
  certificate: acm.ICertificate;
  hostedZone: route53.IHostedZone;
}

export class AmplifyStack extends cdk.Stack {
  public readonly amplifyApp: amplify.CfnApp;
  public readonly mainBranch: amplify.CfnBranch;

  constructor(scope: Construct, id: string, props: AmplifyStackProps) {
    super(scope, id, props);

    const { domainName, appName, environment } = props;

    // IAM Role for Amplify
    const amplifyRole = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      description: `IAM Role for Amplify App ${appName}`,
      roleName: `${appName}-amplify-role-${environment}`,
    });

    // Add necessary permissions for Amplify
    amplifyRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify')
    );

    // Create Amplify App using CfnApp (L1 construct for more control)
    this.amplifyApp = new amplify.CfnApp(this, 'AmplifyApp', {
      name: appName,
      description: `iEctD Web Application - ${environment}`,
      
      // Build specification
      buildSpec: `version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
    appRoot: .
`,
      
      // Environment variables
      environmentVariables: [
        {
          name: 'AMPLIFY_MONOREPO_APP_ROOT',
          value: '.',
        },
        {
          name: '_LIVE_UPDATES',
          value: JSON.stringify([
            {
              pkg: 'node',
              type: 'nvm',
              version: '20',
            },
          ]),
        },
        {
          name: 'AMPLIFY_DIFF_DEPLOY',
          value: 'false',
        },
      ],

      // Platform configuration for Next.js SSR
      platform: 'WEB_COMPUTE',

      // IAM Service Role
      iamServiceRole: amplifyRole.roleArn,

      // Custom rules for routing
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: '404-200',
        },
      ],
    });

    // Create main branch
    this.mainBranch = new amplify.CfnBranch(this, 'MainBranch', {
      appId: this.amplifyApp.attrAppId,
      branchName: 'main',
      description: 'Main production branch',
      enableAutoBuild: true,
      enablePullRequestPreview: false,
      stage: 'PRODUCTION',
      
      // Framework configuration
      framework: 'Next.js - SSR',
      
      // Environment variables specific to this branch
      environmentVariables: [
        {
          name: 'NODE_ENV',
          value: 'production',
        },
      ],
    });

    // Add custom domain
    const domain = new amplify.CfnDomain(this, 'AmplifyDomain', {
      appId: this.amplifyApp.attrAppId,
      domainName: domainName,
      enableAutoSubDomain: false,
      subDomainSettings: [
        {
          branchName: this.mainBranch.branchName,
          prefix: '', // Root domain (iectd.com)
        },
        {
          branchName: this.mainBranch.branchName,
          prefix: 'www', // www.iectd.com
        },
      ],
    });

    // Ensure domain is created after branch
    domain.addDependency(this.mainBranch);

    // Outputs
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: this.amplifyApp.attrAppId,
      description: 'Amplify App ID - Add this to GitHub Secrets as AMPLIFY_APP_ID',
      exportName: `${id}-AmplifyAppId`,
    });

    new cdk.CfnOutput(this, 'AmplifyAppArn', {
      value: this.amplifyApp.attrArn,
      description: 'Amplify App ARN',
      exportName: `${id}-AmplifyAppArn`,
    });

    new cdk.CfnOutput(this, 'AmplifyDefaultDomain', {
      value: `https://main.${this.amplifyApp.attrDefaultDomain}`,
      description: 'Amplify Default Domain URL',
      exportName: `${id}-AmplifyDefaultDomain`,
    });

    new cdk.CfnOutput(this, 'ProductionUrl', {
      value: `https://${domainName}`,
      description: 'Production URL',
      exportName: `${id}-ProductionUrl`,
    });

    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://${this.region}.console.aws.amazon.com/amplify/home?region=${this.region}#/${this.amplifyApp.attrAppId}`,
      description: 'AWS Amplify Console URL',
      exportName: `${id}-AmplifyConsoleUrl`,
    });
  }
}

