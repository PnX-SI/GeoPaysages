const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/./../docker/.env' });

const SERVER_ROOT = Number(process.env.ADMIN_ENV_DEV) ? `http://localhost:${process.env.PROXY_HTTP_PORT}` : '';
const envConfigFile = `export const Conf = {
  apiUrl: '${SERVER_ROOT}/api/',
  img_srv: '${SERVER_ROOT}/api/thumbor/presets/',
  customFiles: '${SERVER_ROOT}/static/custom/',
  id_application: 1,
  map_lat_center: 45.372167,
  map_lan_center: 6.819077,
};`;
console.log(
  'The file `config.ts` will be written with the following content:'
);
console.log(envConfigFile);

const targetPath = './src/app/config.ts';
fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      `Angular config.ts file generated correctly at ${targetPath} \n`
    );
  }
});
