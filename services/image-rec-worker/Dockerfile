# FIXME - This is very unfriendly to different architectures. It
#         works for now though. Tensorflow and opencv-python will not
#         not install right for ARM.

ARG BASE=python:3.6

FROM ${BASE}

WORKDIR /app

RUN pip install \
    'tensorflow>=1.5.0' \
    opencv-python

COPY image-rec-worker/requirements.txt .

RUN pip install -r requirements.txt

COPY image-rec-worker .

ENV IMAGERY_URL='0.0.0.0:8081' \
    REDIS_URL='0.0.0.0:6379'

ENV PYTHONUNBUFFERED=TRUE

CMD PYTHONPATH="${PYTHONPATH}:/app/messages" python worker.py
