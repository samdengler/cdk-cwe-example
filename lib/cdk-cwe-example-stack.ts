import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');

interface MyStackProps extends cdk.StackProps {
  s3Bucket: string;
}

export class CdkCweExampleStack extends cdk.Stack {
  lambdaCode: lambda.CfnParametersCode;

  constructor(scope: cdk.Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    this.lambdaCode = lambda.Code.cfnParameters();
    const handler = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_8_10,
      handler: 'app.handler',
      code: this.lambdaCode,
      environment: {
        S3_BUCKET: props.s3Bucket
      }
    });

    handler.addToRolePolicy(new iam.PolicyStatement({
      resources: [`arn:aws:s3:::${props.s3Bucket}`],
      actions: ['s3:ListBucket']
    }));

    new events.Rule(this, 'MySchedule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      targets: [
        new targets.LambdaFunction(handler)
      ]
    });
  }
}
