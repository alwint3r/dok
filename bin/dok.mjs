#!/usr/bin/env node

import "zx/globals";
import DokfileValidator from "dokfile/validator";
import DokfileParser from "dokfile/parser";

const dokFileValidator = new DokfileValidator();
const dokFileParser = new DokfileParser();

async function main() {
  const tag = argv._[0];
  const dryRun = argv._[1] === "dry";

  if (!tag) {
    console.log("Usage: ");
    console.log("  dok <tag> [dry]");

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
    dryRun
  );

  for (const tag of buildInstructions.additionalBaseTags) {
    await tagImage(
      buildInstructions.baseImage,
      buildInstructions.baseTag,
      buildInstructions.baseImage,
      tag,
      dryRun
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
        dryRun
      );
      builtImagesAndTags.push(result);
    }

    await pushImage(builtImagesAndTags, dryRun);
  }
}

async function buildImage(baseImageName, tag, dockerFile, buildArgs = [], dryRun = false) {
  const imageName = `${baseImageName}:${tag}`;
  const buildArgsString = buildArgs.map(
    (arg) => `--build-arg ${arg.arg}=${arg.value}`
  );
  const buildArgsStringJoined = buildArgsString.join(" ");

  console.log(
    `Building image ${imageName} with args: ${buildArgsStringJoined}`
  );

  if (!dryRun) {
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
  dryRun
) {
  const imageName = `${baseImageName}:${tag}`;
  const target = `${targetImageName}:${targetTag}`;

  console.log(`Tagging ${imageName} as ${target}`);

  if (!dryRun) {
    await $`docker tag ${imageName} ${target}`;
  }

  return target;
}

async function pushImage(tags, dryRun) {
  for (const tag of tags) {
    console.log(`Pushing ${tag}`);

    if (!dryRun) {
      await $`docker push ${tag}`;
    }
  }
}

await main();
