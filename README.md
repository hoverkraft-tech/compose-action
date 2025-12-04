<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItYW5jaG9yIiBjb2xvcj0iYmx1ZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSI1IiByPSIzIj48L2NpcmNsZT48bGluZSB4MT0iMTIiIHkxPSIyMiIgeDI9IjEyIiB5Mj0iOCI+PC9saW5lPjxwYXRoIGQ9Ik01IDEySDJhMTAgMTAgMCAwIDAgMjAgMGgtMyI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Docker Compose Action

<div align="center">
  <img src=".github/logo.svg" width="60px" align="center" alt="Docker Compose Action" />
</div>

---

<!-- header:end -->

<!-- badges:start -->

[![Marketplace](https://img.shields.io/badge/Marketplace-docker--compose--action-blue?logo=github-actions)](https://github.com/marketplace/actions/docker-compose-action)
[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/compose-action)](https://github.com/hoverkraft-tech/compose-action/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/compose-action)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/compose-action?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/compose-action?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/compose-action/blob/main/CONTRIBUTING.md)
[![codecov](https://codecov.io/gh/hoverkraft-tech/compose-action/graph/badge.svg?token=90JXB7EIMA)](https://codecov.io/gh/hoverkraft-tech/compose-action)

<!-- badges:end -->

<!-- overview:start -->

## Overview

This action runs your compose file(s) and clean up before action finished

### Action

The action will run `docker compose up` to start the services defined in the given compose file(s).
The compose file(s) can be specified using the `compose-file` input.
Some extra options can be passed to the `docker compose up` command using the `up-flags` input.

### Post hook

On post hook, the action will run `docker compose down` to clean up the services.

Logs of the Docker Compose services are logged using GitHub `core.ts` API before the cleanup.
The log level can be set using the `services-log-level` input.
The default is `debug`, which will only print logs if [debug mode](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/troubleshooting-workflows/enabling-debug-logging) is switched on.

Some extra options can be passed to the `docker compose down` command using the `down-flags` input.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/compose-action@248470ecc5ed40d8ed3d4480d8260d77179ef579 # v2.4.2
  with:
    # Additional options to pass to `docker` command.
    docker-flags: ""

    # Path to compose file(s). It can be a list of files. It can be absolute or relative to the current working directory (cwd).
    # Default: `./docker-compose.yml`
    compose-file: ./docker-compose.yml

    # Services to perform `docker compose up`.
    services: ""

    # Additional options to pass to `docker compose up` command.
    up-flags: ""

    # Additional options to pass to `docker compose down` command.
    down-flags: ""

    # Additional options to pass to `docker compose` command.
    compose-flags: ""

    # Current working directory
    # Default: `${{ github.workspace }}`
    cwd: ${{ github.workspace }}

    # Compose version to use.
    # If null (default), it will use the current installed version.
    # If "latest", it will install the latest version.
    compose-version: ""

    # The log level used for Docker Compose service logs.
    # Can be one of "debug", "info".
    #
    # Default: `debug`
    services-log-level: debug

    # The GitHub token used to create an authenticated client (to fetch the latest version of Docker Compose).
    # Default: `${{ github.token }}`
    github-token: ${{ github.token }}
```

<!-- usage:end -->

<!-- inputs:start -->

## Inputs

| **Input**                | **Description**                                                                                                            | **Required** | **Default**                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------- |
| **`docker-flags`**       | Additional options to pass to `docker` command.                                                                            | **false**    | -                           |
| **`compose-file`**       | Path to compose file(s). It can be a list of files. It can be absolute or relative to the current working directory (cwd). | **false**    | `./docker-compose.yml`      |
| **`services`**           | Services to perform `docker compose up`.                                                                                   | **false**    | -                           |
| **`up-flags`**           | Additional options to pass to `docker compose up` command.                                                                 | **false**    | -                           |
| **`down-flags`**         | Additional options to pass to `docker compose down` command.                                                               | **false**    | -                           |
| **`compose-flags`**      | Additional options to pass to `docker compose` command.                                                                    | **false**    | -                           |
| **`cwd`**                | Current working directory                                                                                                  | **false**    | `$\{\{ github.workspace }}` |
| **`compose-version`**    | Compose version to use.                                                                                                    | **false**    | -                           |
|                          | If null (default), it will use the current installed version.                                                              |              |                             |
|                          | If "latest", it will install the latest version.                                                                           |              |                             |
| **`services-log-level`** | The log level used for Docker Compose service logs.                                                                        | **false**    | `debug`                     |
|                          | Can be one of "debug", "info".                                                                                             |              |                             |
| **`github-token`**       | The GitHub token used to create an authenticated client (to fetch the latest version of Docker Compose).                   | **false**    | `$\{\{ github.token }}`     |

<!-- inputs:end -->

<!-- secrets:start -->
<!-- secrets:end -->

<!-- outputs:start -->
<!-- outputs:end -->

<!-- examples:start -->

## Examples

### Example using in a full workflow

```yaml
name: Docker Compose Action

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4.2.2

      - name: Run docker compose
        uses: hoverkraft-tech/compose-action@248470ecc5ed40d8ed3d4480d8260d77179ef579 # v2.4.2
        with:
          compose-file: "./docker/docker-compose.yml"

      - name: Execute tests in the running services
        run: |
          docker compose exec test-app pytest
```

### Example Using environment variables

```yaml
steps:
  - uses: actions/checkout@v4.2.2
  - uses: hoverkraft-tech/compose-action@248470ecc5ed40d8ed3d4480d8260d77179ef579 # v2.4.2
    with:
      compose-file: "./docker/docker-compose.yml"
    env:
      CUSTOM_VARIABLE: "test"
```

### Example using `services`

Perform `docker compose up` to some given service instead of all of them

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v3
  - uses: hoverkraft-tech/compose-action@248470ecc5ed40d8ed3d4480d8260d77179ef579 # v2.4.2
    with:
      compose-file: "./docker/docker-compose.yml"
      services: |
        helloworld2
        helloworld3
```

### Example using `up-flags`

Specify flags to pass to the `docker compose up`.

Default is none.

Can be used to pass the `--build` flag, for example, if you want persistent volumes to be deleted as well during cleanup.

A full list of flags can be found in the [Docker compose up documentation](https://docs.docker.com/compose/reference/up/).

### Example using `down-flags`

Specify flags to pass to the `docker compose down` command during cleanup.

Default is none.

Can be used to pass the want persistent volumes to be deleted as well during cleanup.

A full list of flags can be found in the [Docker compose down documentation](https://docs.docker.com/compose/reference/down/).

### Example using `compose-flags`

Specify flags to pass to the `docker compose` command. Default is none.

A full list of flags can be found in the [Docker compose documentation](https://docs.docker.com/compose/reference/#command-options-overview-and-help).

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v3
  - uses: hoverkraft-tech/compose-action@248470ecc5ed40d8ed3d4480d8260d77179ef579 # v2.4.2
    with:
      compose-file: "./docker/docker-compose.yml"
      compose-flags: "--profile profile-1"
```

Specify multiple compose files to use with the `docker compose` command.

This is useful when you have a base compose file and additional files for different environments or configurations.

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v3
  - uses: hoverkraft-tech/compose-action@248470ecc5ed40d8ed3d4480d8260d77179ef579 # v2.4.2
    with:
      compose-file: |
        ./docker/docker-compose.yml
        ./docker/docker-compose.ci.yml
```

<!-- examples:end -->

<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/compose-action/blob/main/CONTRIBUTING.md) for more details.

<!-- contributing:end -->

<!-- security:start -->
<!-- security:end -->

<!-- license:start -->

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2025 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->

<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
