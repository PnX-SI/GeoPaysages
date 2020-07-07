import os
import sys

from configparser import ConfigParser
from iptcinfo3 import IPTCInfo
from PIL import Image, ImageFile, IptcImagePlugin
from PIL.IptcImagePlugin import getiptcinfo
from sqlalchemy import engine_from_config, text
from sqlalchemy.engine import Engine

from .client import gpClient
from .patterns import date_from_group_dict

ImageFile.LOAD_TRUNCATED_IMAGES = True

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
                save_in_db = config.getboolean(site_section(s),'save_in_db', fallback=False)
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

def retrieve_copyright_notice(fn:str) -> str:
    '''Retrieves the copyright notice from the input file'''
    try:
        info = IPTCInfo(fn)
        return info['copyright notice']
    except:
        return None

def process_image(ifile:str, size, ofile:str=None):
    '''resize an image and return the output file name and the exif and iptc meta data'''
    try:
        im  = Image.open(ifile)
        xif = im.info.get('exif')
        cr_notice = retrieve_copyright_notice(ifile)

        dest = ofile if size and ofile else ifile #Target the input file if the output file is not provided
        
        if size:
            im2 = im.resize(size)

            params = dict(exif=xif) if xif else dict()   
            im2.save(dest, **params)
        
        # Pillow does not the save the iptc meta data. We have to put them back manually
        if cr_notice:
            iptc = IPTCInfo(dest)
            iptc['copyright notice'] = cr_notice
            iptc.save()

        return (dest, xif, cr_notice)
    except Exception as e:
        printfailure('could not process image ', ifile, 'traceback ', str(e))
        return (ifile, None, None)

def sqlalchemy_engine_from_config(configfile:str) -> Engine:
    '''Returns an sqlalchemy engine'''
    with open(configfile, 'r') as cf:
        config = ConfigParser()
        config.read_file(cf)

        return engine_from_config(
            dict(config.items('main')),
            prefix='sqlalchemy.'
        )

def get_site_id(engine: Engine, sitename:str):
    '''Returns a site id'''
    try:
        return engine.execute(
            text('select id_site from geopaysages.t_site where name_site=:name limit 1'),
            name=sitename
        ).scalar()
    except:
        printfailure('Could not retrieve site : "', sitename, '" id from the database')
        return None

def insert_image_in_db(engine: Engine, siteid:int, matchdict: dict, exif=None, cp_notice=None):
    query = text('insert into geopaysages.t_photo (id_site, path_file_photo, date_photo, filter_date, copyright, display_gal_photo)\
        values (:id_site, :path, :strfdate, :date, :cpnotice, :display)'
    )

    date = date_from_group_dict(matchdict)
    cnx = engine.connect()

    tran = cnx.begin()
    try:
        cnx.execute(
            query,
            id_site = siteid,
            path = matchdict.get('ofilename'),
            strfdate = date.strftime('%d/%m/%y'),
            date = date,
            cpnotice = cp_notice,
            display = True
        )
        tran.commit()
    except:
        printfailure('Could not insert image ', matchdict.get('ofilename'), ' into database')
        tran.rollback()


def printfailure(*args, **kwargs):
    '''prints error message into stderr for failure tolerent operations'''
    print(*args, file=sys.stderr, **kwargs)