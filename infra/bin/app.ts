#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmplifyStack } from '../lib/amplify-stack';
import { DnsStack } from '../lib/dns-stack';

const app = new cdk.App();

// Configuration
const domainName = app.node.tryGetContext('domainName') || 'iectd.com';
const appName = app.node.tryGetContext('appName') || 'iectd-web';
const environment = app.node.tryGetContext('environment') || 'production';

// AWS Environment
const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1',
};

// Tags for all resources
const tags = {
  Application: appName,
  Environment: environment,
  ManagedBy: 'CDK',
  Project: 'iEctD',
};

// DNS Stack - Creates/manages Route53 hosted zone and SSL certificate
const dnsStack = new DnsStack(app, `${appName}-dns-${environment}`, {
  env,
  domainName,
  description: `DNS and SSL Certificate stack for ${domainName}`,
  tags,
});

// Amplify Stack - Creates Amplify app with custom domain
const amplifyStack = new AmplifyStack(app, `${appName}-amplify-${environment}`, {
  env,
  domainName,
  appName,
  environment,
  certificate: dnsStack.certificate,
  hostedZone: dnsStack.hostedZone,
  description: `AWS Amplify hosting stack for ${appName}`,
  tags,
});

// Add dependency
amplifyStack.addDependency(dnsStack);

app.synth();

