#!/usr/bin/env bash

set -e

# Pre-pre-flight? 🤷
if [[ -n "$MSYSTEM" ]]; then
    echo "Seems like you are using an MSYS2-based system (such as Git Bash) which is not supported. Please use WSL instead.";
    exit 1
fi

script_file="docker/docker.sh"
if ! test -f "$script_file"; then
    echo "Please execute this script from the parent of the docker directory"
    echo "The command should be ./docker/docker.sh"
    exit 1
fi

prestart_file="backend/prestart.sh"
if ! [ -x "$prestart_file" ]; then 
    chmod +x ${prestart_file}
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

launch_compose="docker-compose"
if ! command -v ${launch_compose} &> /dev/null
then
    launch_compose="docker compose"
fi
${launch_compose} --project-name="geopaysages" --project-directory=./docker "$@"