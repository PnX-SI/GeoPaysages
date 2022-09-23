[pytest]
testpaths = geopaysagesftpclient/tests
python_files = *.py

[main]
sqlalchemy.url = postgres://user:password@localhost/geopaysages

[ftp]
host = ftp.ecrins-parcnational.fr
port = 3921
user = photo
password = 
