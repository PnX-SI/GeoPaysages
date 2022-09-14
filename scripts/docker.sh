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
docker-compose --project-name="geopaysages" --project-directory=./docker "$@"