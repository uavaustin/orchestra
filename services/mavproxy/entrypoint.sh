#!/usr/bin/sh

# Wrapper around mavproxy.py that allows for a tune to be set.
# Essentially, if the environment variable STARTING_TUNE is set, we
# just copy in the contents into a file that mavproxy reads on
# startup.

if [ -n "$STARTING_TUNE" ]; then
    printf "\033[32mAdding in tune: \"$STARTING_TUNE\"\033[0m\n"
    echo "playtune $STARTING_TUNE" > .mavinit.scr
fi

mavproxy.py "$@"
