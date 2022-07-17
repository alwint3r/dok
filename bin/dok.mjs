#!/usr/bin/env node

import "zx/globals";
import DokfileValidator from "dokfile/validator";
import DokfileParser from "dokfile/parser";

const dokFileValidator = new DokfileValidator();
const dokFileParser = new DokfileParser();

async function main() {
  const tag = argv._[0];
  const runMode = argv._[1] || 'full';
  const shouldPush = ['full', 'pushOnly'].includes(runMode);
  const shouldBuild = ['full', 'buildOnly'].includes(runMode);

  if (!tag) {
    console.log("Usage: ");
    console.log("  dok <tag> [full|buildOnly|pushOnly|dry]");

    process.exit(-1);
  }

  const dokfilePath = path.join(process.cwd(), ".dokfile");
  const dokFile = await fs.readFile(dokfilePath, "utf8");
  dokFileValidator.validate(dokFile);

  const buildInstructions = dokFileParser.parse(dokFile, tag);

  await buildImage(
    buildInstructions.baseImage,
    buildInstructions.baseTag,
    buildInstructions.dockerFileName || 'Dockerfile',
    buildInstructions.buildArgs,
    shouldBuild
  );

  for (const tag of buildInstructions.additionalBaseTags) {
    await tagImage(
      buildInstructions.baseImage,
      buildInstructions.baseTag,
      buildInstructions.baseImage,
      tag,
      shouldBuild
    );
  }

  if (buildInstructions.remoteImageName) {
    const builtImagesAndTags = [];

    for (const tag of buildInstructions.remoteTags) {
      const result = await tagImage(
        buildInstructions.baseImage,
        buildInstructions.baseTag,
        buildInstructions.remoteImageName,
        tag,
        shouldBuild
      );
      builtImagesAndTags.push(result);
    }

    await pushImage(builtImagesAndTags, shouldPush);
  }
}

async function buildImage(baseImageName, tag, dockerFile, buildArgs = [], shouldBuild = true) {
  const imageName = `${baseImageName}:${tag}`;
  const buildArgsString = buildArgs.map(
    (arg) => `--build-arg ${arg.arg}=${arg.value}`
  );
  const buildArgsStringJoined = buildArgsString.join(" ");

  console.log(
    `Building image ${imageName} with args: ${buildArgsStringJoined}`
  );

  if (shouldBuild) {
    const cmd = `docker build ${buildArgsStringJoined} -t ${imageName} -f ${dockerFile} .`;
    await $([cmd]);
  }

  return imageName;
}

async function tagImage(
  baseImageName,
  tag,
  targetImageName,
  targetTag,
  shouldBuild
) {
  const imageName = `${baseImageName}:${tag}`;
  const target = `${targetImageName}:${targetTag}`;

  console.log(`Tagging ${imageName} as ${target}`);

  if (shouldBuild) {
    await $`docker tag ${imageName} ${target}`;
  }

  return target;
}

async function pushImage(tags, shouldPush) {
  for (const tag of tags) {
    console.log(`Pushing ${tag}`);

    if (shouldPush) {
      await $`docker push ${tag}`;
    }
  }
}

await main();
