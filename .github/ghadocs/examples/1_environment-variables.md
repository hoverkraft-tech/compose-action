<!-- markdownlint-disable first-line-heading -->

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
