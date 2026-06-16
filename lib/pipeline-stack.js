const { Stack, Stage, Fn } = require("aws-cdk-lib");
const {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} = require("aws-cdk-lib/pipelines");
const { PipelineType } = require("aws-cdk-lib/aws-codepipeline");
const { BackendStack } = require("./backend-stack");

class PipelineStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const githubConnectionArn = Fn.importValue("GlobalGitHubConnectionArn");

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "user-confirm-lambda-trigger-pipeline",
      pipelineType: PipelineType.V2,
      crossAccountKeys: false,
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.connection(
          "bnreine/user-confirm-lambda-trigger",
          "main",
          {
            connectionArn: githubConnectionArn,
            triggerOnPush: true, // Automatically runs on git push
          },
        ),
        commands: ["npm install", "npx cdk synth"],
      }),
    });

    pipeline.addStage(new ProductionStage(this, "Deploy"));
  }
}

class ProductionStage extends Stage {
  constructor(scope, id, props) {
    super(scope, id, props);

    new BackendStack(this, "BackendStack");
  }
}

module.exports = { PipelineStack, ProductionStage };
