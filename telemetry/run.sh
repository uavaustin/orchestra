#!/bin/sh

# Start the Flask app, if the RETRY_CXN flag is set to 1, it'll keep
# connecting forever.

run_it() {
    python -u $(dirname $0)"/telemetry.py"

    err=$?

    # Restart if desired and if the script returns an error code of
    # 30
    if [ "$RETRY_CXN" = 1 ] && [ "$err" -eq 30 ] ; then
        sleep 1
        printf "\033[33mRestarting...\033[0m\n"
        sleep 1

        run_it
    fi

    exit $err
}

run_it
exit "$?"
