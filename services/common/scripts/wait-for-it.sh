#!/bin/sh

# This script will block until a response it received from a server.
# Pass the url (host:port) as the first argment.
#
# Optionally, also pass in the server name (defaults to just 
# "server") as the second argument.


url=$1
name=$2

if [ -z "$name" ]; then
    name="server"
fi

send() {
    curl --output /dev/null --silent --head $url
}

wait_status() {
    printf "Waiting for response from $name... "

    if [ "$1" -lt 10 ]; then
        printf "(~"$1"s)"
    elif [ "$1" -lt 30 ]; then
        printf "\033[33m(~"$1"s)\033[0m"
    else
        printf "\033[31m(~"$1"s)\033[0m"
    fi

    printf "\n"
}

send

if [ "$?" -ne 0 ]; then
    printf "\033[33m"
    printf "Polling $name until it is online.\n"
    printf "\033[0m"

    seconds=0

    # Block until we get something
    until $(send); do
        seconds=$((seconds + 1))

        sleep 1

        if [ $((seconds % 5)) -eq 0 ]; then
            wait_status $seconds
        fi
    done
fi

printf "\033[32m"
printf "Received response from $name.\n"
printf "\033[0m"
