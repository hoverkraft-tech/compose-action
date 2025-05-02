#checkov:skip=CKV_DOCKER_2: required
FROM ghcr.io/super-linter/super-linter:slim-v7

ARG UID=1000
ARG GID=1000
RUN chown -R ${UID}:${GID} /github/home
USER ${UID}:${GID}

ENV RUN_LOCAL=true 
ENV USE_FIND_ALGORITHM=true
ENV LOG_LEVEL=WARN
ENV LOG_FILE="../logs"