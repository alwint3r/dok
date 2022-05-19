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

In your project, create a `.dokfile` file with the following format:

```
{
    "image-name": "",
    "remote-url": ""
}
```

Then run:

```sh
dok <tag> [dry]
```

**Note**:

1. Provide `dry` argument to dry run instead of actually building, tagging, and pushing the image.
2. Make sure you have .dokfile and Dockerfile in the same directory otherwise the script will not work.
3. Make sure you are logged in to a remote docker registry if you specify the remote url.

