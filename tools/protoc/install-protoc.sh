#!/bin/sh

# This file will get the precomplied version of protoc if we're on
# x86-64, otherwise we'll have to build from source.

ORIG_DIR=$(pwd)
INSTALL_DIR=$HOME"/.protoc"

# We'll get the url for protobuf from this file.
. $(dirname $0)"/protobuf-version.sh"

mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

fetch_x86_64() {
    # We're simply going to get the precompiled binary from the
    # github release, and then symlink it into /usr/local/bin
    printf "\033[32m"
    printf "Installing protoc with precompiled binary...\n"
    printf "\033[0m"

    sleep 5

    set -ex

    apt-get update
    apt-get install -y wget unzip

    wget -O "protoc_precompiled.zip" $PROTOC_URL
    unzip "protoc_precompiled.zip"

    ln -s $INSTALL_DIR"/bin/protoc" "/usr/local/bin/protoc"

    set +ex
}

install_from_source() {
    # We'll be fetching the C++ source and compiling protoc from
    # there. After, we'll run the suite of tests to make sure it
    # works. Note that this will take quite a long time.
    printf "\033[33m"
    printf "Installing protoc from source, this will take a long time...\n"
    printf "\033[0m"

    sleep 5

    set -ex

    apt-get update
    apt-get install -y autoconf automake libtool wget curl make g++ unzip

    wget -O "protobuf_source.zip" $PROTOBUF_CXX_URL
    unzip "protobuf_source.zip"

    cd protobuf-$PROTOBUF_VERSION

    ./configure
    make -j4
    make check
    make install
    ldconfig

    set +ex
}

# If we're on x86-64 fetch the precompiled binary so we don't have to
# compile from source.
x86_64=$(uname -a | grep "x86_64" | wc -l)

if [ $x86_64 = 1 ]; then
    fetch_x86_64
else
    install_from_source
fi

cd $ORIG_DIR
