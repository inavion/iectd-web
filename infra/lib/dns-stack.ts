import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface DnsStackProps extends cdk.StackProps {
  domainName: string;
}

export class DnsStack extends cdk.Stack {
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    const { domainName } = props;

    // Look up existing hosted zone for iectd.com
    // If you need to create a new one, uncomment the creation code below
    this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName,
    });

    // Uncomment this to create a new hosted zone if one doesn't exist
    // this.hostedZone = new route53.HostedZone(this, 'HostedZone', {
    //   zoneName: domainName,
    //   comment: `Hosted zone for ${domainName}`,
    // });

    // Create SSL Certificate with DNS validation
    // Note: For Amplify, the certificate needs to be in us-east-1 for CloudFront
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`*.${domainName}`, `www.${domainName}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
      certificateName: `${domainName}-certificate`,
    });

    // Outputs
    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: this.hostedZone.hostedZoneId,
      description: 'Route53 Hosted Zone ID',
      exportName: `${id}-HostedZoneId`,
    });

    new cdk.CfnOutput(this, 'HostedZoneName', {
      value: this.hostedZone.zoneName,
      description: 'Route53 Hosted Zone Name',
      exportName: `${id}-HostedZoneName`,
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'SSL Certificate ARN',
      exportName: `${id}-CertificateArn`,
    });
  }
}

