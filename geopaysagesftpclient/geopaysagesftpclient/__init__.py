import os
import sys
from configparser import ConfigParser

from .client import gpClient
from .patterns import date_from_group_dict

def connect(host:str, port:int=21, user:str=None, pwd:str=None) -> gpClient:
    '''Establishes an ftp connection
    Args:
        host (str): ftp host
        port (int, optional): ftp connection port. Defaults to 21.
        user (str, optional): ftp connection login. Defaults to None.
        pwd (str, optional): ftp connection password. Defaults to None.
    Raises:
        Exception: BaseException if the connection could not be established.
    Returns:
        geopaysagesftpfetch.client.gpClient: geopaysage FTP_TLS client.
    '''
    try:
        client = gpClient()
        client.connect(host, port=port)
        print(client.getwelcome())

        if user and pwd: # If the connection is not anonymous
            client.auth()
            client.login(user, pwd)

        client.set_pasv(True)
        client.prot_p()

        return client
    except:
        raise Exception('Could not connect to ftp://{0}@{1}:{2}'.format(
            user, host, port
        ))

def connect_for_test() -> gpClient:
    '''Returns a test connection
    Raises:
        Exception: BaseException if the connection provided by the pytest.ini file could not be established
    Returns:
        [type]: [description]
    '''
    config = ConfigParser()

    try:
        with open('pytest.ini') as f:
            config.read_file(f)
            
            return connect(
                config.get('ftp','host'),
                config.getint('ftp','port'),
                config.get('ftp','user'),
                config.get('ftp','password')
            )
    except:
        raise Exception('Could not create test connection, check the pytest.ini file content')

def get_site_resize(config: ConfigParser, site:str) -> tuple:
    raw_value = config.get(site, 'resize', fallback=None)

    if raw_value:
        try:
            split = raw_value.split(',')
            return (
                int(split[0].strip()),
                int(split[1].strip())
            )
        except:
            return None
    else:
        return None

def read_config_file(config_filename:str) -> dict:
    '''Parses and returns the config file content
    Args:
        config_filename (str): config file name
    Raises:
        Exception: [description]
    Returns:
        dict: parsed config content as dict
    '''
    config = ConfigParser()
    try:
        with open(config_filename, 'r') as f:
            config.read_file(f)

        db = config.get('main','sqlalchemy.url', fallback=None) #db connection string
        outputdir = config.get('main', 'outputdir')
        sites = list(
            filter(
                lambda s: bool(s),
                config.get('main', 'sites').splitlines()
            )
        )
        site_section = lambda s: 'sites.' + s #the site config section in the .ini file

        sites_config = {
            s: dict(
                host    = config.get(site_section(s), 'host'),
                port    = config.getint(site_section(s), 'port', fallback=21),
                user    = config.get(site_section(s), 'user'),
                password    = config.get(site_section(s), 'password'),
                inputpattern    = config.get(site_section(s), 'inputpattern'),
                outputpattern   = config.get(site_section(s), 'outputpattern'),
                resize  = get_site_resize(config, site_section(s)),
                save_in_db = config.getboolean(site_section(s),'save_in_db', fallback=False),
                copyright_notice = config.get(site_section(s), 'copyright_notice', fallback=None),
            )
            for s in sites
        }
        return dict(
            outputdir = outputdir,
            db = db,
            sites = sites_config
        )

    except:
        raise Exception('Could not parse config file')

def printfailure(*args, **kwargs):
    '''prints error message into stderr for failure tolerent operations'''
    print(*args, file=sys.stderr, **kwargs)