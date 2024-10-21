#!/usr/bin/env bash

set -e

if (( $# < 1 )); then
    exit 0
fi

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

source docker/.env;
if [ $1 = "up" ]; then
    cd docker
    if ! test -d "$CUSTOM_PATH"; then
        cp -r custom.sample "$CUSTOM_PATH"
        echo "The custom dir was created on $CUSTOM_PATH"
    else
        rsync -av --ignore-existing custom.sample/static/ "$CUSTOM_PATH/static/"
    fi
    cd ../
fi

launch_compose="docker-compose"
if ! command -v ${launch_compose} &> /dev/null
then
    launch_compose="docker compose"
    set +e
    docker compose version &> /dev/null
    if [ $? -ne 0 ]; then
        echo "The 'docker compose' is not available. Please install or update docker."
        exit 1
    fi
    set -e
fi

if [ "$HTTPS_IN_PROXY" == "1" ]; then
    ${launch_compose} --project-name="${PROJECT}" -f ./docker/docker-compose.yml -f ./docker/docker-compose.https.yml "$@"
else
    ${launch_compose} --project-name="${PROJECT}" --project-directory=./docker "$@"
fi