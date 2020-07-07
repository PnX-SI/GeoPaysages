import os
import sys

from configparser import ConfigParser
from iptcinfo3 import IPTCInfo, c_datasets
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

def retrieve_copyright_notice(fn:str) -> dict:
    '''Retrieves the copyright notice from the input file
    Returns
    -------
    Tuple (copyright notice, description)
    '''
    info = IPTCInfo(fn)
    return {
        key: info[key]
        for key in c_datasets.values() if info[key]
    }

def process_image(ifile:str, siteconfig, ofile:str=None):
    '''resize an image and return the output file name and the exif and iptc meta data'''
    try:
        size = siteconfig.get('resize')
        site_copyright_notice = siteconfig.get('copyright_notice')

        im  = Image.open(ifile)
        im_xif = im.info.get('exif')
        im_iptc = retrieve_copyright_notice(ifile)

        dest = ofile if size and ofile else ifile #Target the input file if the output file is not provided
        
        # Image resizing with exif preservation
        if size:
            im2 = im.resize(size)

            params = dict(exif=im_xif) if im_xif else dict()   
            im2.save(dest, **params)

        # IPTC data rewriting. IPTC are lost during the resize operation. We have to put them back manually
        # If the inputfile contains a copyright notice, then use it instead of the siteconfig value
        im_iptc['copyright notice'] = im_iptc.get('copyright notice', site_copyright_notice)

        if im_iptc or site_copyright_notice:
            iptc = IPTCInfo(dest)

            for key in im_iptc:
                iptc[key] = im_iptc[key]
            iptc.save()

        return (dest, im_xif, im_iptc)
    except Exception as e:
        printfailure('could not process image ', ifile, ' traceback ', str(e))
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

def get_licence_id (engine: Engine, iptc:dict):
    '''Get the Licence id that matches the copyright notice or create it if none exists in the database'''
    if not iptc:
        return None

    notice = iptc.get('copyright notice')
    cnx = engine.connect()

    id_licence_photo = cnx.execute(
        text(
        'select id_licence_photo from geopaysages.dico_licence_photo where name_licence_photo = :nt'
        ), nt=notice
    ).scalar()

    if not id_licence_photo:
        id_licence_photo = cnx.execute(
            text(
                'insert into geopaysages.dico_licence_photo (name_licence_photo, description_licence_photo) values (:nt,:desc) returning id_licence_photo'
            ), nt=notice, desc=notice
        ).scalar()

    return id_licence_photo

def insert_image_in_db(engine: Engine, siteid:int, matchdict: dict, exif=None, iptc=None):
    query = text('insert into geopaysages.t_photo \
        (id_site, path_file_photo, date_photo, filter_date, display_gal_photo, id_licence_photo)\
        values (:id_site, :path, :strfdate, :f_date, :display, :id_licence)'
    )

    id_licence_photo = get_licence_id(engine, iptc) if iptc else None
    filter_date = date_from_group_dict(matchdict)
    cnx = engine.connect()

    tran = cnx.begin()
    try:
        cnx.execute(
            query,
            id_site = siteid,
            path = matchdict.get('ofilename'),
            strfdate = date_from_group_dict(matchdict).strftime('%d/%m/%y'),
            f_date = filter_date,
            display = True,
            id_licence=id_licence_photo
        )
        tran.commit()
    except:
        printfailure('Could not insert image ', matchdict.get('ofilename'), ' into database')
        tran.rollback()
        raise


def printfailure(*args, **kwargs):
    '''prints error message into stderr for failure tolerent operations'''
    print(*args, file=sys.stderr, **kwargs)