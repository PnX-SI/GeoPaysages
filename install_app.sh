if [ "$(id -u)" == "0" ]; then
   echo -e "\e[91m\e[1mThis script should NOT be run as root but your user needs sudo rights\e[0m" >&2
   exit 1
fi

. install_configuration/settings.ini

echo "Stopping application..."
sudo /etc/init.d/supervisor stop $app_name

echo "Creating and activating Virtual env..."
python3 -m venv $venv_dir

. $venv_dir/bin/activate

echo "Installing requirements..."
pip install -r ./backend/requirements.txt


echo "Creating configuration files "
cp ./backend/config.py.tpl ./backend/config.py
