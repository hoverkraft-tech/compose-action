<!-- markdownlint-disable first-line-heading -->

### Example using `compose-flags`

Specify flags to pass to the `docker compose` command. Default is none. A full
list of flags can be found in the
[Docker compose documentation](https://docs.docker.com/compose/reference/#command-options-overview-and-help).

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
