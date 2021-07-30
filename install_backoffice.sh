if [ "$(id -u)" == "0" ]; then
   echo -e "\e[91m\e[1mThis script should NOT be run as root but your user needs sudo rights\e[0m" >&2
   exit 1
fi

echo "Installation de npm"


wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
export NVM_DIR="$HOME/.nvm"
 [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 8.10.0

echo " ############"
echo "Installation des paquets npm"
npm install -g @angular/cli@7.0.5

cd ./front-backOffice/
npm install 

cp src/favicon.ico.sample src/favicon.ico

# build app
ng build --prod --base-href /app_admin/
