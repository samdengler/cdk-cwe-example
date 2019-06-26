# Instructions

comment

## Prerequisites

1. Install Node.js (>= 8.11.x): https://nodejs.org/en/download/

2. Install CDK: `npm install -g aws-cdk`

3. Install SAM (for local testing): https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html


## Test locally

From the **cdk-cwe-example** directory ...

1. `(cd my_function && npm install)`

    Installs the Node.js Lambda function dependencies in the **my_function** directory w/o change the parent directory

    ```
    $ (cd my_function && npm install)
    npm WARN my_function@1.0.0 No description
    npm WARN my_function@1.0.0 No repository field.
    
    audited 17 packages in 0.337s
    found 0 vulnerabilities
    ```

2. `npm run build`

    Compiles the Typescript lib/cdk-cwe-example-stack.ts to Javascript (also in the lib directory)

    ```
    $ npm run build
    
    > cdk-cwe-example@0.1.0 build /Users/****************************/cdk-cwe-example
    > tsc
    ```

3. `cdk synth --no-staging -c S3_BUCKET=REPLACE_WITH_YOUR_S3_BUCKET > template.yaml`

    Synthesize the CDK TypeScript code to CloudFormation templates.  In this case, it does not package and deploy your Lambda function to S3 so that you can test locally. **Remember to substitute REPLACE_WITH_YOUR_S3_BUCKET with your S3 Bucket**

4. `sam local invoke --no-event`

    Invoke your Lambda function using a local SAM Docker environment without providing event data.  Conventionally, SAM looks for **template.yaml** and invokes the only Lambda function defined in this case.

    ```
    $ sam local invoke --no-event
    2019-06-24 08:55:25 Invoking app.handler (nodejs8.10)
    2019-06-24 08:55:25 Found credentials in shared credentials file: ~/.aws/credentials
    2019-06-24 08:55:25 Requested to skip pulling images ...
    
    2019-06-24 08:55:25 Mounting /Users/****************************/cdk-cwe-example/my_function as /var/task:ro,delegated inside runtime container
    START RequestId: 199ff11a-dcbf-1675-fa84-296a1610c72c Version: $LATEST
    2019-06-24T12:55:27.070Z	199ff11a-dcbf-1675-fa84-296a1610c72c
    {}
    2019-06-24T12:55:27.071Z	199ff11a-dcbf-1675-fa84-296a1610c72c	S3_BUCKET = *******
    END RequestId: 199ff11a-dcbf-1675-fa84-296a1610c72c
    REPORT RequestId: 199ff11a-dcbf-1675-fa84-296a1610c72c	Duration: 940.83 ms	Billed Duration: 1000 ms	Memory Size: 128 MB	Max Memory Used: 46 MB
    
    "success"
    ```

## Deploy to AWS

1. `AWS_DEFAULT_REGION=REPLACE_WITH_YOUR_AWS_REGION cdk deploy -c S3_BUCKET=REPLACE_WITH_YOUR_AWS_BUCKET`

    Packages your Lambda Function + dependencies and copies to S3, then deploys your CDK Application into your AWS Account using the AWS Region specified.  **Remember to substitute REPLACE_WITH_YOUR_REGION with your AWS Region and REPLACE_WITH_YOUR_S3_BUCKET with your S3 Bucket**

    ```
    $ AWS_DEFAULT_REGION=us-east-1 cdk deploy -c S3_BUCKET=*******
    This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
    Please confirm you intend to make the following modifications:
    
    IAM Statement Changes
    ┌───┬──────────────────────────────────────┬────────┬───────────────────────┬──────────────────────────────────────┬────────────────────────────────────────┐
    │   │ Resource                             │ Effect │ Action                │ Principal                            │ Condition                              │
    ├───┼──────────────────────────────────────┼────────┼───────────────────────┼──────────────────────────────────────┼────────────────────────────────────────┤
    │ + │ ${MyFunction.Arn}                    │ Allow  │ lambda:InvokeFunction │ Service:events.amazonaws.com         │ "ArnLike": {                           │
    │   │                                      │        │                       │                                      │   "AWS:SourceArn": "${MySchedule.Arn}" │
    │   │                                      │        │                       │                                      │ }                                      │
    ├───┼──────────────────────────────────────┼────────┼───────────────────────┼──────────────────────────────────────┼────────────────────────────────────────┤
    │ + │ ${MyFunction/ServiceRole.Arn}        │ Allow  │ sts:AssumeRole        │ Service:lambda.${AWS::URLSuffix}     │                                        │
    ├───┼──────────────────────────────────────┼────────┼───────────────────────┼──────────────────────────────────────┼────────────────────────────────────────┤
    │ + │ arn:aws:s3:::*******                 │ Allow  │ s3:ListBucket         │ AWS:${MyFunction/ServiceRole}        │                                        │
    └───┴──────────────────────────────────────┴────────┴───────────────────────┴──────────────────────────────────────┴────────────────────────────────────────┘
    IAM Policy Changes
    ┌───┬───────────────────────────┬────────────────────────────────────────────────────────────────────────────────┐
    │   │ Resource                  │ Managed Policy ARN                                                             │
    ├───┼───────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
    │ + │ ${MyFunction/ServiceRole} │ arn:${AWS::Partition}:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole │
    └───┴───────────────────────────┴────────────────────────────────────────────────────────────────────────────────┘
    (NOTE: There may be security-related changes not in this list. See http://bit.ly/cdk-2EhF7Np)
    
    Do you wish to deploy these changes (y/n)? y
    CdkCweExampleStack: deploying...
    Updated: asset.412de6a711ca1d448f47285f1bd429792f6a1b9d547e6167dcbd960cccaf75a1 (zip)
    CdkCweExampleStack: creating CloudFormation changeset...
     0/7 | 09:03:11 | CREATE_IN_PROGRESS   | AWS::CloudFormation::Stack | CdkCweExampleStack User Initiated
     0/7 | 09:03:45 | CREATE_IN_PROGRESS   | AWS::IAM::Role          | MyFunction/ServiceRole (MyFunctionServiceRole3C357FF2)
     0/7 | 09:03:45 | CREATE_IN_PROGRESS   | AWS::IAM::Role          | MyFunction/ServiceRole (MyFunctionServiceRole3C357FF2) Resource creation Initiated
     0/7 | 09:03:45 | CREATE_IN_PROGRESS   | AWS::CDK::Metadata      | CDKMetadata
     0/7 | 09:03:48 | CREATE_IN_PROGRESS   | AWS::CDK::Metadata      | CDKMetadata Resource creation Initiated
     1/7 | 09:03:48 | CREATE_COMPLETE      | AWS::CDK::Metadata      | CDKMetadata
     2/7 | 09:04:00 | CREATE_COMPLETE      | AWS::IAM::Role          | MyFunction/ServiceRole (MyFunctionServiceRole3C357FF2)
     2/7 | 09:04:04 | CREATE_IN_PROGRESS   | AWS::IAM::Policy        | MyFunction/ServiceRole/DefaultPolicy (MyFunctionServiceRoleDefaultPolicyB705ABD4)
     2/7 | 09:04:05 | CREATE_IN_PROGRESS   | AWS::IAM::Policy        | MyFunction/ServiceRole/DefaultPolicy (MyFunctionServiceRoleDefaultPolicyB705ABD4) Resource creation Initiated
     3/7 | 09:04:11 | CREATE_COMPLETE      | AWS::IAM::Policy        | MyFunction/ServiceRole/DefaultPolicy (MyFunctionServiceRoleDefaultPolicyB705ABD4)
     3/7 | 09:04:14 | CREATE_IN_PROGRESS   | AWS::Lambda::Function   | MyFunction (MyFunction3BAA72D1)
     3/7 | 09:04:15 | CREATE_IN_PROGRESS   | AWS::Lambda::Function   | MyFunction (MyFunction3BAA72D1) Resource creation Initiated
     4/7 | 09:04:15 | CREATE_COMPLETE      | AWS::Lambda::Function   | MyFunction (MyFunction3BAA72D1)
     4/7 | 09:04:18 | CREATE_IN_PROGRESS   | AWS::Events::Rule       | MySchedule (MySchedule8CBD34AD)
     4/7 | 09:04:19 | CREATE_IN_PROGRESS   | AWS::Events::Rule       | MySchedule (MySchedule8CBD34AD) Resource creation Initiated
    4/7 Currently in progress: CdkCweExampleStack, MySchedule8CBD34AD
     5/7 | 09:05:19 | CREATE_COMPLETE      | AWS::Events::Rule       | MySchedule (MySchedule8CBD34AD)
     5/7 | 09:05:22 | CREATE_IN_PROGRESS   | AWS::Lambda::Permission | MyFunction/AllowEventRuleCdkCweExampleStackMyScheduleE336F88B (MyFunctionAllowEventRuleCdkCweExampleStackMyScheduleE336F88BAC50A34F)
     5/7 | 09:05:22 | CREATE_IN_PROGRESS   | AWS::Lambda::Permission | MyFunction/AllowEventRuleCdkCweExampleStackMyScheduleE336F88B (MyFunctionAllowEventRuleCdkCweExampleStackMyScheduleE336F88BAC50A34F) Resource creation Initiated
     6/7 | 09:05:33 | CREATE_COMPLETE      | AWS::Lambda::Permission | MyFunction/AllowEventRuleCdkCweExampleStackMyScheduleE336F88B (MyFunctionAllowEventRuleCdkCweExampleStackMyScheduleE336F88BAC50A34F)
     7/7 | 09:05:34 | CREATE_COMPLETE      | AWS::CloudFormation::Stack | CdkCweExampleStack
    
     ✅  CdkCweExampleStack
    
    Stack ARN:
    arn:aws:cloudformation:us-east-1:************:stack/CdkCweExampleStack/67f72060-9680-11e9-b332-12f2c8f206e2
    ```
