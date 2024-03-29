#!/usr/bin/env node

import { DokfileFactory, OperationsGenerator } from "dokfile-next";
import "zx/globals";

async function main() {
  const tag = argv._[0];
  const runMode = argv._[1] || "full";
  const shouldPush = ["full", "pushOnly"].includes(runMode);
  const shouldBuild = ["full", "buildOnly"].includes(runMode);

  if (!tag) {
    console.log("Usage: ");
    console.log("  dok <tag> [full|buildOnly|pushOnly|dry]");

    process.exit(-1);
  }

  const dokfilePath = path.join(process.cwd(), ".dokfile");
  const dokfileContent = await fs.readFile(dokfilePath, "utf8");
  const dokfile = DokfileFactory.fromJson(dokfileContent);
  const operations = OperationsGenerator.fromDokfile(dokfile, tag);

  for (const op of operations.build) {
    await buildImage(op, shouldBuild);
  }

  for (const op of operations.tag) {
    await tagImage(op, shouldBuild);
  }

  for (const op of operations.push) {
    await pushImage(op, shouldPush);
  }
}

async function buildImage(buildOperation, shouldBuild = true) {
  const args = buildOperation.build.args;
  const argsKeys = Object.keys(args);
  const joinedArgs = argsKeys
    .map((argKey) => `--build-arg ${argKey}="${args[argKey]}"`)
    .join(" ");
  const extraArgs = buildOperation.build.extraArgs;
  const extraArgsKeys = Object.keys(extraArgs);
  const extraArgsJoined = extraArgsKeys.map((key) => `--${key}=${extraArgs[key]}`)
    .join(" ");

  console.log(`Building ${buildOperation.target} with args: ${joinedArgs} and ${extraArgsJoined}`);

  if (shouldBuild) {
    const cmd = `docker build ${joinedArgs} -t ${buildOperation.target} -f ${buildOperation.build.dockerfile} ${extraArgsJoined} .`;
    await $([cmd]);
  }
}

async function tagImage(tagOperation, shouldTag = true) {
  console.log(
    `Tagging ${tagOperation.fullTag} from ${tagOperation.from.fullTag}`
  );

  if (shouldTag) {
    await $`docker tag ${tagOperation.from.fullTag} ${tagOperation.fullTag}`;
  }
}

async function pushImage(pushOperation, shouldPublish = true) {
  console.log(`Pushing ${pushOperation.target}`);

  if (shouldPublish) {
    await $`docker push ${pushOperation.target}`;
  }
}

await main();
