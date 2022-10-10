#!/usr/bin/env bash

set -e

# Pre-pre-flight? 🤷
if [[ -n "$MSYSTEM" ]]; then
    echo "Seems like you are using an MSYS2-based system (such as Git Bash) which is not supported. Please use WSL instead.";
    exit 1
fi

env_file="docker/.env"
if ! test -f "$env_file"; then
    echo "$env_file file doesn't not exists. Create it from docker/.env.tpl. (customize if necessary)"
    exit 1
fi

custom_dir="custom"
if ! test -d "$custom_dir"; then
    cp -r docker/custom.sample custom
    echo "The custom dir was created on the project's root."
fi

docker-compose -f ./docker/docker-compose-prod.yml --project-name="geopaysages" --project-directory=./docker "$@"