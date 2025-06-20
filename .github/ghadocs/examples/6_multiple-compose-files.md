<!-- markdownlint-disable first-line-heading -->

### Example with multiple compose files

Specify multiple compose files to use with the `docker compose` command. This is
useful when you have a base compose file and additional files for different
environments or configurations.

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v3
  - uses: hoverkraft-tech/compose-action@v1.5.1
    with:
      compose-file: |
        ./docker/docker-compose.yml
        ./docker/docker-compose.ci.yml
```
