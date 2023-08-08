# Docker Compose Action

This action runs your docker-compose file and clean up before action finished.

## Inputs

### `compose-file`

**Optional** The name of the compose file. Default `"./docker-compose.yml"`.

It can be a list of files:

```yml
compose-file: |
  docker-compose.yml
  docker-compose.ci.yml
```

### `services`

**Optional** Just perform `docker-compose up` to one service instead of all of them

### `up-flags`

**Optional** Used to specify flags to pass to the `docker-compose up`. Default is none. Can be used to pass the `--build` flag, for example, if you want persistent volumes to be deleted as well during cleanup. A full list of flags can be found in the [docker-compose up documentation](https://docs.docker.com/compose/reference/up/).

### `down-flags`

**Optional** Used to specify flags to pass to the `docker-compose down` command during cleanup. Default is none. Can be used to pass the `--volumes` flag, for example, if you want persistent volumes to be deleted as well during cleanup. A full list of flags can be found in the [docker-compose down documentation](https://docs.docker.com/compose/reference/down/).

### `compose-flags`

**Optional** Used to specify flags to pass to the `docker-compose` command. Default is none. A full list of flags can be found in the [docker-compose documentation](https://docs.docker.com/compose/reference/#command-options-overview-and-help).

## Example usage

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v3
  - uses: isbang/compose-action@v1.5.1
    with:
      compose-file: "./docker/docker-compose.yml"
      down-flags: "--volumes"
      services: |
        helloworld2
        helloworld3
```

### Using environment variables

```yaml
steps:
  - uses: actions/checkout@v3
  - uses: isbang/compose-action@v1.5.1
    with:
      compose-file: "./docker/docker-compose.yml"
    env:
      CUSTOM_VARIABLE: "test"
```
