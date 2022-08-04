#!/usr/bin/env bash

set -e

# Pre-pre-flight? 🤷
if [[ -n "$MSYSTEM" ]]; then
    echo "Seems like you are using an MSYS2-based system (such as Git Bash) which is not supported. Please use WSL instead.";
    exit 1
fi

docker compose -f ./docker/docker-compose-demo.yml --env-file ./docker/.env-demo  --project-name="geopaysages" --project-directory=./docker "$@"