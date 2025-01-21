<!-- markdownlint-disable-next-line first-line-heading -->
### Example using `services`

Perform `docker compose up` to some given service instead of all of them

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
