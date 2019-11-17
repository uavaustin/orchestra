FROM python:2-alpine

RUN apk --no-cache add \
   	py-lxml \
   	gcc \
   	libxml2 \
   	libxml2-dev \
   	libxslt \
   	libxslt-dev \
   	libc-dev

# mavnative expects a different assert method signature than the one currently
# in GCC, so we have to hack the expected method signature in
# https://github.com/gmyoungblood-parc/docker-alpine-ardupilot/blob/master/Dockerfile#L81
RUN sed -i 's/, int,/, unsigned int,/' /usr/include/assert.h

RUN pip install mavproxy

# TODO: multi-stage

COPY mavproxy/entrypoint.sh .

ENTRYPOINT ["sh", "entrypoint.sh"]
