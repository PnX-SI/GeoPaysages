#!/bin/bash
scripts_dir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
app_dir="$scripts_dir"
cd "$app_dir"
app_dir="$(pwd)"
app_dir_name=$(basename $app_dir)

now=$(date +"%Y%m%d%H%M")
prev_app_suffix="-$now"
prev_app_dir="$app_dir$prev_app_suffix"

version="v1.0.0-rc.3.4"
#read -p "Enter version number (ex: 1.0.0-rc.3.4): "  version
read -r -p "Do you want to update to version $version? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    cd "../"

    if [ ! -f "$version.zip" ]
    then
        wget "https://github.com/PnX-SI/GeoPaysages/archive/$version.zip"
    fi

    echo "Version $version ready to install."
    read -r -p "Do you want to continue? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
    then
	echo "Backup prev version to $prev_app_dir"
        mv $app_dir $prev_app_dir
        unzip "$version.zip"
        version_number=${version:1}
        mv "GeoPaysages-$version_number" $app_dir_name
	echo "Copy custom config"
	cp "$prev_app_dir/backend/config.py" "$app_dir_name/backend/config.py"
	echo "Copy custom translations"
	mv "$app_dir_name/backend/i18n" "$app_dir_name/backend/i18n-$version"
	cp -r "$prev_app_dir/backend/i18n" "$app_dir_name/backend/i18n"
	echo "Copy custom css and images"
	cp -r "$prev_app_dir/backend/static/custom" "$app_dir_name/backend/static"
	
	cd $app_dir_name
	
	echo "Creating and activating virtual env"
	python3 -m venv venv

	. venv/bin/activate

	echo "Installing requirements"
	pip install wheel
	pip install -r ./backend/requirements.txt
	
	echo "Restart"
	#sudo service supervisor restart

	#TODO install backoffice
    fi
fi
