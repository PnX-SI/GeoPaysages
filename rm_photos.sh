#!/bin/bash
scripts_dir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
app_dir="$scripts_dir"
cd "$app_dir"
app_dir="$(pwd)"
app_dir_name=$(basename $app_dir)

cd '../data/images/'

find . -type f -name download_\* -exec rm {} \;
find . -type f -name large_\* -exec rm {} \;
find . -type f -name medium_\* -exec rm {} \;
find . -type f -name thumbnail\* -exec rm {} \;