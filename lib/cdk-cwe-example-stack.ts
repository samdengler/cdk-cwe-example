import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');

export class CdkCweExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.Nodejs810,
      handler: 'app.handler',
      code: lambda.Code.asset('./my_function'),
      environment: {
        S3_BUCKET: this.node.tryGetContext('S3_BUCKET')
      }
    });

    handler.addToRolePolicy(new iam.PolicyStatement({
      resources: [`arn:aws:s3:::${this.node.tryGetContext('S3_BUCKET')}`],
      actions: ['s3:ListBucket']
    }));

    new events.Rule(this, 'MySchedule', {
      schedule: events.Schedule.rate(1, events.TimeUnit.Minute),
      targets: [
        new targets.LambdaFunction(handler)
      ]
    });
  }
}
