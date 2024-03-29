<!-- markdownlint-disable-next-line first-line-heading -->
### Example using `down-flags`

Specify flags to pass to the `docker-compose down` command during cleanup.
Default is none. Can be used to pass the `--volumes` flag, for example, if you
want persistent volumes to be deleted as well during cleanup. A full list of
flags can be found in the
[docker-compose down documentation](https://docs.docker.com/compose/reference/down/).
