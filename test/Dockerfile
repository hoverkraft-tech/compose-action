#checkov:skip=CKV_DOCKER_2: required
FROM alpine:3

WORKDIR /app

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["/bin/sh", "entrypoint.sh"]

USER 1000:1000
