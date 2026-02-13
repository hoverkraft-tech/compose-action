FROM ghcr.io/super-linter/super-linter:slim-v8.5.0

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 CMD ["/bin/sh","-c","test -d /github/home"]
ARG UID=1000
ARG GID=1000
RUN chown -R ${UID}:${GID} /github/home
USER ${UID}:${GID}

ENV RUN_LOCAL=true 
ENV USE_FIND_ALGORITHM=true
ENV LOG_LEVEL=WARN
ENV LOG_FILE="/github/home/logs"
