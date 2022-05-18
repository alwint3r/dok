#!/usr/bin/env zx

async function main() {
  const tag = argv._[1];
  const dryRun = argv._[2] === "dry";

  if (!tag) {
    console.log('Usage: ');
    console.log('  dok <tag> [dry]');

    process.exit(-1);
  }

  const dokfilePath = path.join(process.cwd(), ".dokfile");
  const dokFile = await fs.readFile(dokfilePath, "utf8");
  const parsedDokFile = JSON.parse(dokFile);

  const baseImageName = parsedDokFile["image-name"];
  const baseTag = tag;

  let remoteTags = [];
  let remoteImageName = "";

  const targetTags = ["latest"];

  await buildImage(baseImageName, baseTag, dryRun);

  for (const tag of targetTags) {
    tagImage(baseImageName, baseTag, baseImageName, tag, dryRun);
  }

  if (parsedDokFile["remote-url"]) {
    remoteTags = [baseTag, "latest"];

    remoteImageName = `${parsedDokFile["remote-url"]}/${baseImageName}`;

    const builtImagesAndTags = [];

    for (const tag of remoteTags) {
      const result = await tagImage(
        baseImageName,
        baseTag,
        remoteImageName,
        tag,
        dryRun
      );
      builtImagesAndTags.push(result);
    }

    await pushImage(builtImagesAndTags, dryRun);
  }
}

async function buildImage(baseImageName, tag, dryRun) {
  const imageName = `${baseImageName}:${tag}`;

  console.log(`Building image ${imageName}`);

  if (!dryRun) {
    await $`docker build -t ${imageName} .`;
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
