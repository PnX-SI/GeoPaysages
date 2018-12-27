#!/bin/bash

# Make sure only root can run our script

if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

sudo apt-get update
sudo apt-get upgrade
sudo apt-get install unzip
sudo apt-get install postgresql postgresql-contrib postgis postgresql-9.6-postgis-2.3 postgresql-9.6-postgis-2.3-scripts
sudo apt-get install python3
sudo apt-get install python3-venv
sudo systemctl stop apache2
sudo apt-get install nginx supervisor



