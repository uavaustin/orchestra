#/bin/sh

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

send

if [ "$?" -ne 0 ]; then
    printf "\033[33m"
    printf "Polling $name until it is online.\n"
    printf "\033[0m"

    # Block until we get something
    until $(send); do
        sleep 5
        printf "Waiting for response from $name...\n"
    done
fi

printf "\033[32m"
printf "Received response from $name.\n"
printf "\033[0m"
