#!/bin/bash
scripts_dir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
app_dir="$scripts_dir"
cd "$app_dir"
app_dir="$(pwd)"
app_dir_name=$(basename $app_dir)

version="v1.0.0-rc.3.4"
#read -p "Enter version number (ex: 1.0.0-rc.3.4): "  version
read -r -p "Start update to version $version? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
    cd "../"
	
	version_number=${version:1}
	new_app_dir_name="GeoPaysages-$version_number"
	
	if [ ! -d "$new_app_dir_name" ]; then
		if [ ! -f "$version.zip" ]; then
			wget "https://github.com/PnX-SI/GeoPaysages/archive/$version.zip"
		fi
		unzip "$version.zip"
	fi

    echo "Version $version ready to install."
    read -r -p "Do you want to continue? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
		echo "Copy custom config"
		cp "$app_dir_name/backend/config.py" "$new_app_dir_name/backend/config.py"
		echo "Copy custom translations"
		mv "$new_app_dir_name/backend/i18n" "$new_app_dir_name/backend/i18n-$version"
		cp -r "$app_dir_name/backend/i18n" "$new_app_dir_name/backend/i18n"
		echo "Copy custom css and images"
		cp -r "$app_dir_name/backend/static/custom" "$new_app_dir_name/backend/static"
		echo "Copy backoffice config"
		cp "$app_dir_name/front-backOffice/src/app/config.ts" "$new_app_dir_name/front-backOffice/src/app"
		
		echo "Creating and activating virtual env"
		cd $new_app_dir_name
		python3 -m venv ./venv

		echo "Installing requirements"
		. ./venv/bin/activate
		pip install wheel
		pip install -r ./backend/requirements.txt
		deactivate
		cd ../

		now=$(date +"%Y%m%d%H%M")
		prev_app_dir_name="$app_dir-$now"
		echo "Backup prev version to $prev_app_dir_name"	
		mv $app_dir_name $prev_app_dir_name
		mv $new_app_dir_name $app_dir_name
		
		echo "Restart"
		#sudo service supervisor restart

		echo "Install backoffice"
		cd "$app_dir_name/front-backOffice/"
		npm install
		ng build --prod --base-href /app_admin/
		mkdir -p "../../app_admin-$version"
		cp -r ./dist/front-backOffice/* "../../app_admin-$version/"
		cd ../../
		echo "Backup prev backoffice to app_admin-$version"	
		mv ./app_admin "./app_admin-$now"
		mv "./app_admin-$version" ./app_admin
    fi
fi
