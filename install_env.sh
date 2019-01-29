#!/bin/bash

sudo apt-get update
sudo apt-get upgrade
sudo apt-get install unzip
sudo apt-get install postgresql postgresql-contrib postgis postgresql-9.6-postgis-2.3 postgresql-9.6-postgis-2.3-scripts
sudo apt-get install python3
sudo apt-get install python3-venv
sudo systemctl stop apache2
sudo apt-get install nginx supervisor

mkdir -p ./var/log/
sudo mkdir -p /var/log/oppv_vanoise


