if [ "$(id -u)" == "0" ]; then
   echo -e "\e[91m\e[1mThis script should NOT be run as root but your user needs sudo rights\e[0m" >&2
   exit 1
fi

. install_configuration/settings.ini

echo "Stopping application..."
sudo /etc/init.d/supervisor stop $app_name

echo "Creating and activating Virtual env..."
python3 -m venv venv

. venv/bin/activate

mkdir -p ../data/images
mkdir -p ../data/notice-photo

echo "Installing requirements..."
pip install wheel
pip install -r ./backend/requirements.txt


cp backend/static/custom/images/sample.png.sample backend/static/custom/images/sample.png
cp backend/static/custom/css/page-style.css.sample backend/static/custom/css/page-style.css
cp backend/static/custom/css/page-sample.css.sample backend/static/custom/css/page-sample.css
cp backend/static/custom/logo/logo_txt_blanc.png.sample backend/static/custom/logo/logo_txt_blanc.png
cp backend/static/custom/logo/logo_txt_color.png.sample backend/static/custom/logo/logo_txt_color.png
cp i18n/messages.pot.sample i18n/messages.pot 
cp i18n/fr/LC_MESSAGES/messages.mo.sample i18n/fr/LC_MESSAGES/messages.mo
cp i18n/fr/LC_MESSAGES/messages.po.sample i18n/fr/LC_MESSAGES/messages.po


cp ./backend/static/assets/images/oppv-005-03-2014.jpg ../data/images/
cp ./backend/static/assets/images/oppv-005-00-2006.jpg ../data/images/

deactivate
