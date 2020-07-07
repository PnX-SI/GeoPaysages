[main]
outputdir = /home/mv/workspace/data/images
sites =
    glacier_blanc_lateral

sqlalchemy.url = postgres://<user>:<password>@localhost/geopaysages

[sites.glacier_blanc_lateral]
host = ftp.ecrins-parcnational.fr
port = 3921
user = <user>
password = <password>
inputpattern = timelapse/glacierblanc/lateral/{Y}{M}{D}/.+JPG
outputpattern = {site}_{Y}-{M}-{D}_{filename}
resize = (<w>,<h>) #optional
save_in_db = false
