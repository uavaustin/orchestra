FROM grafana/grafana

COPY grafana/provisioning /etc/grafana/provisioning

# Grafana's Dockerfile uses ENTRYPOINT so we have to override
# ENTRYPOINT ourselves instead of using CMD. Sigh.
ENTRYPOINT envsubst "$INFLUX_HOST $INFLUX_PORT $DB_NAME" \
        < /etc/grafana/provisioning/datasources/datasource.yaml \
        > /etc/grafana/provisioning/datasources/datasource.yaml && \
    /run.sh
