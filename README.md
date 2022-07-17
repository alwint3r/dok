# dok

Build, tag, and push docker image to a remote docker registry.

## Dependency & Installation

### google/zx

Install using npm:

```sh
npm install -g zx
```

### Docker

Follow installation guidelines provided by official documentation.

### Installation

```sh
git clone https://github.com/alwint3r/dok.git
cd dok
npm install -g .
```

## Usage

Make sure you have a valid and working Dockerfile in the root directory of your project.

Create a `.dokfile` file in the same directory with the following format:

```
{
    "image-name": "",
    "remote-url": ""
}
```

You may omit the `remote-url` if you are building and deploying locally, dok will not push the image to remote repository in this case.

For example, you want to build, tag, and push the docker image with `v1.0.0` tag. Here's the complete command:

```
dok v1.0.0 full
```

or simply

```
dok v1.0.0
```

Dok will build, tag, and push the image(s) by default.

### Build Only

If you want to build and tag but don't want to push the image(s), then you can provide `buildOnly` as argument.

```
dok v1.0.0 buildOnly
```

### Push Only

If you only want to push the previously built image, then provide `pushOnly` as the argument.

```
dok v1.0.0 pushOnly
```

### Dry Run

If you are just checking what dok does without actually doing anything, just provide `dry` as the argument.

```
dok v1.0.0 dry
```


## CLI

```
dok <tag> [full|buildOnly|pushOnly|dry]
```

