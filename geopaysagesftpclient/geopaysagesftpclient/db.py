from sqlalchemy import engine_from_config, text
from sqlalchemy.engine import Engine
from configparser import ConfigParser
from geopaysagesftpclient import printfailure
from geopaysagesftpclient.patterns import date_from_group_dict

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
    author = iptc.get('by-line') or ''
    if not notice:
        return None

    licence = '{0} | {1}'.format(notice, author)
    
    cnx = engine.connect()

    id_licence_photo = cnx.execute(
        text(
        'select id_licence_photo from geopaysages.dico_licence_photo where name_licence_photo = :nt'
        ), nt=licence
    ).scalar()

    if not id_licence_photo:
        id_licence_photo = cnx.execute(
            text(
                'insert into geopaysages.dico_licence_photo (name_licence_photo, description_licence_photo) values (:nt,:desc) returning id_licence_photo'
            ), nt=licence, desc=licence
        ).scalar()

    return id_licence_photo

def insert_image_in_db(engine: Engine, siteid:int, matchdict: dict, exif=None, iptc=None):
    ''' Inserts an image into the database '''
    query = text('insert into geopaysages.t_photo \
        (id_site, path_file_photo, date_photo, filter_date, display_gal_photo, id_licence_photo)\
        values (:id_site, :path, :strfdate, :f_date, :display, :id_licence)'
    )

    id_licence_photo = get_licence_id(engine, iptc) if iptc else None
    filter_date = date_from_group_dict(matchdict).isoformat()
    cnx = engine.connect()

    tran = cnx.begin()
    try:
        cnx.execute(
            query,
            id_site = siteid,
            path = matchdict.get('ofilename'),
            strfdate = date_from_group_dict(matchdict).isoformat(),
            f_date = filter_date,
            display = True,
            id_licence=id_licence_photo
        )
        tran.commit()
    except:
        tran.rollback()
        raise
