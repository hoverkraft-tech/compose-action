#checkov:skip=CKV_DOCKER_2: required
FROM alpine:3

WORKDIR /app

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

HEALTHCHECK CMD ["grep", "-qa", "entrypoint.sh", "/proc/1/cmdline"]

CMD ["/bin/sh", "entrypoint.sh"]

USER 1000:1000
