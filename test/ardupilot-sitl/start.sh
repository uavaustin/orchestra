#!/bin/bash

mavproxy.py --master tcp:127.0.0.1:5760 \
--sitl 127.0.0.1:5501 \
--out udpin:0.0.0.0:14550 \
--daemon

/ardupilot/Tools/autotest/sim_vehicle.py --vehicle ${VEHICLE} -I${INSTANCE} \
--custom-location=${LAT},${LON},${ALT},${DIR} -w --frame ${MODEL} --no-rebuild \
--no-mavproxy --speedup ${SPEEDUP} & mavproxy.py \
--master tcp:127.0.0.1:5760 \
--sitl 127.0.0.1:5501 \
--out udpin:0.0.0.0:14550 \
