<!-- markdownlint-disable-next-line first-line-heading -->
<div align="center" width="100%">
<!-- start branding -->

<img src=".github/ghadocs/branding.svg" width="15%" align="center" alt="branding<icon:anchor color:gray-dark>" />

<!-- end branding -->
<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:anchor color:gray-dark>" /> GitHub Action: Docker Compose Action

<!-- end title -->
<!-- start badges -->

<a href="https%3A%2F%2Fgithub.com%2F%2F%2Freleases%2Flatest"><img src="https://img.shields.io/github/v/release//?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20tag" /></a><a href="https%3A%2F%2Fgithub.com%2F%2F%2Freleases%2Flatest"><img src="https://img.shields.io/github/release-date//?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20date" /></a><img src="https://img.shields.io/github/last-commit//?logo=github&style=flat-square" alt="Commit" /><a href="https%3A%2F%2Fgithub.com%2F%2F%2Fissues"><img src="https://img.shields.io/github/issues//?logo=github&style=flat-square" alt="Open%20Issues" /></a><img src="https://img.shields.io/github/downloads///total?logo=github&style=flat-square" alt="Downloads" />

<!-- end badges -->

</div>
<!-- start description -->

This action runs your docker-compose file and clean up before action finished

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: /@v1.0.0
  with:
    # Description: Relative path to compose file(s). It can be a list of files.
    #
    # Default: ./docker-compose.yml
    compose-file: ""

    # Description: Services to perform docker-compose up.
    #
    services: ""

    # Description: Additional options to pass to `docker-compose up` command.
    #
    # Default:
    up-flags: ""

    # Description: Additional options to pass to `docker-compose down` command.
    #
    # Default:
    down-flags: ""

    # Description: Additional options to pass to `docker-compose` command.
    #
    # Default:
    compose-flags: ""
```

<!-- end usage -->

## Inputs

<!-- start inputs -->

| **Input**                  | **Description**                                                         | **Default**                       | **Required** |
| -------------------------- | ----------------------------------------------------------------------- | --------------------------------- | ------------ |
| <code>compose-file</code>  | Relative path to compose file(s). It can be a list of files.            | <code>./docker-compose.yml</code> | **false**    |
| <code>services</code>      | Services to perform docker-compose up.                                  |                                   | **false**    |
| <code>up-flags</code>      | Additional options to pass to <code>docker-compose up</code> command.   |                                   | **false**    |
| <code>down-flags</code>    | Additional options to pass to <code>docker-compose down</code> command. |                                   | **false**    |
| <code>compose-flags</code> | Additional options to pass to <code>docker-compose</code> command.      |                                   | **false**    |

<!-- end inputs -->
<!-- start outputs -->
<!-- end outputs -->

## Examples

<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

### Example Using environment variables

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: hoverkraft-tech/compose-action@v1.5.1
    with:
      compose-file: "./docker/docker-compose.yml"
    env:
      CUSTOM_VARIABLE: "test"
```

### Example using `services`

Perform `docker-compose up` to some given service instead of all of them

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v3
  - uses: hoverkraft-tech/compose-action@v1.5.1
    with:
      compose-file: "./docker/docker-compose.yml"
      services: |
        helloworld2
        helloworld3
```

### Example using `up-flags`

Specify flags to pass to the `docker-compose up`. Default is none. Can be used to pass the `--build` flag, for example, if you want persistent volumes to be deleted as well during cleanup. A full list of flags can be found in the [docker-compose up documentation](https://docs.docker.com/compose/reference/up/).

### Example using `down-flags`

Specify flags to pass to the `docker-compose down` command during cleanup. Default is none. Can be used to pass the `--volumes` flag, for example, if you want persistent volumes to be deleted as well during cleanup. A full list of flags can be found in the [docker-compose down documentation](https://docs.docker.com/compose/reference/down/).

### Example using `compose-flags`

Specify flags to pass to the `docker-compose` command. Default is none. A full list of flags can be found in the [docker-compose documentation](https://docs.docker.com/compose/reference/#command-options-overview-and-help).

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v3
  - uses: hoverkraft-tech/compose-action@v1.5.1
    with:
      compose-file: "./docker/docker-compose.yml"
      services: |
        helloworld2
        helloworld3
```
