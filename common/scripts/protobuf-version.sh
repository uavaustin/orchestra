#!/bin/sh

# This file is intended to be sourced by other files

export PROTOBUF_URL=https://github.com/google/protobuf/releases/download/
export PROTOBUF_VERSION=3.4.0

# Gets url and accepts the language name as an argument
get_lang_url() {
    zip_file="protobuf-"$1"-"$PROTOBUF_VERSION".zip"

    echo $PROTOBUF_URL"v"$PROTOBUF_VERSION"/"$zip_file
}

# Gets the url for the x86-64 precompiled protoc
get_protoc_url() {
    zip_file="protoc-"$PROTOBUF_VERSION"-linux-x86_64.zip"

    echo $PROTOBUF_URL"v"$PROTOBUF_VERSION"/"$zip_file
}

export PROTOBUF_CXX_URL=$(get_lang_url cpp)
export PROTOBUF_PYTHON_URL=$(get_lang_url python)
export PROTOC_URL=$(get_protoc_url)
