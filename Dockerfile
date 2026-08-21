FROM ghcr.io/hoverkraft-tech/docker-base-images/super-linter:0.6.0
HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 CMD ["/bin/sh","-c","test -d /github/home"]
ARG UID=1000
ARG GID=1000
USER ${UID}:${GID}
