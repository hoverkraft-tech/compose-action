# Docker Compose Action

This action runs your docker-compose file and clean up before action finished.

## Inputs

### `compose-file`

**Optional** The name of the compose file. Default `"./docker-compose.yml"`.

## Example usage

```yaml
steps:
  # need checkout before using compose-action
  - uses: actions/checkout@v2
  - uses: isbang/compose-action@v0.1
    with:
      compose-file: './docker/docker-compose.yml'
```