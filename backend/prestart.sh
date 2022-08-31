#!/usr/bin/env bash

cp -r /initial-photos/* /app/static/upload
flask db upgrade