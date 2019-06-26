import cdk = require('@aws-cdk/core');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import lambda = require("@aws-cdk/aws-lambda");

export interface CodePipelineStackProps extends cdk.StackProps {
  lambdaCode: {
    [key: string]: lambda.CfnParametersCode;
  }
}

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CodePipelineStackProps) {
    super(scope, id, props);

    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub',
      owner: 'samdengler',
      repo: 'cdk-cwe-example',
      oauthToken: cdk.SecretValue.secretsManager('my-github-token'),
      output: sourceOutput,
      trigger: codepipeline_actions.GitHubTrigger.POLL
    });
  
    const cdkBuildProject = new codebuild.PipelineProject(this, 'CdkBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_8_11_0
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: 'npm install'
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk synth DevStack -- -o build',
            ]
          }
        },
        artifacts: {
          'base-directory': 'build',
          files: [
            'DevStack.template.json',
            'ProdStack.template.json',
          ]
        }
      })
    });
    const cdkBuildOutput = new codepipeline.Artifact();
    const cdkBuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CdkCodeBuild',
      project: cdkBuildProject,
      input: sourceOutput,
      outputs: [cdkBuildOutput]
    });
  
    const lambdaBuildProject = new codebuild.PipelineProject(this, 'LambdaBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_8_11_0
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: 'cd my_function'
          },
          build: {
            commands: 'npm install'
          }
        },
        artifacts: {
          'base-directory': 'my_function',
          files: '**/*'
        }
      })
    });
    const lambdaBuildOutput = new codepipeline.Artifact();
    const lambdaBuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'LambdaCodeBuild',
      project: lambdaBuildProject,
      input: sourceOutput,
      outputs: [lambdaBuildOutput]
    });
  
    const deployDevAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'CFN_Deploy_Dev',
      stackName: 'DevMyFunctionStack',
      templatePath: cdkBuildOutput.atPath('DevStack.template.json'),
      adminPermissions: true,
      parameterOverrides: {
        ...props.lambdaCode.dev.assign(lambdaBuildOutput.s3Location),
      },
      extraInputs: [
        lambdaBuildOutput,
      ]
    });

    const deployProdAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'CFN_Deploy_Prod',
      stackName: 'ProdMyFunctionStack',
      templatePath: cdkBuildOutput.atPath('ProdStack.template.json'),
      adminPermissions: true,
      parameterOverrides: {
        ...props.lambdaCode.prod.assign(lambdaBuildOutput.s3Location),
      },
      extraInputs: [
        lambdaBuildOutput,
      ]
    });

    const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
      actionName: 'ManualApproval'
    });
  
    new codepipeline.Pipeline(this, 'MyPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [ sourceAction ]
        },
        {
          stageName: 'Build',
          actions: [ cdkBuildAction, lambdaBuildAction ]
        },
        {
          stageName: 'DeployDev',
          actions: [ deployDevAction ]
        },
        {
          stageName: 'ManualApproval',
          actions: [ manualApprovalAction ]
        },
        {
          stageName: 'DeployProd',
          actions: [ deployProdAction ]
        },
      ]
    });
  }
}