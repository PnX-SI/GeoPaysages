#!/usr/bin/env bash

cp -r /app/install_resources/images/* /app/static/upload/images
flask db upgrade