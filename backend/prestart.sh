#!/usr/bin/env bash

cp -r /initial-photos/* /upload
flask db upgrade