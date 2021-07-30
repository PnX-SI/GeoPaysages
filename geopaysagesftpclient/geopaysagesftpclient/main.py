import argparse

from geopaysagesftpclient import (
    connect,
    read_config_file
)
from geopaysagesftpclient.db import (
    sqlalchemy_engine_from_config,
    insert_image_in_db,
    get_site_id
)
from geopaysagesftpclient.images import process_image


def process(config_filename):
    config = read_config_file(config_filename)
    engine = sqlalchemy_engine_from_config(config_filename)

    print('files will be saved in', config['outputdir'])

    for site in config.get('sites',[]):
        siteconfig = config['sites'][site]
        save_in_db = config['sites'][site].get('save_in_db')
        siteid = get_site_id(engine, site) if save_in_db else None
        print('Fetching from site :',site, siteid,sep=' ')

        c = connect(
            siteconfig.get('host'),
            siteconfig.get('port'),
            siteconfig.get('user'),
            siteconfig.get('password')
        )

        pipeline = c.retrieve_images(
            site,
            input_pattern = siteconfig['inputpattern'],
            output_pattern = siteconfig['outputpattern'],
            outputdir= config['outputdir']
        )

        for f,g in pipeline:
            (_dest, xif, iptc) = process_image(f, siteconfig)

            if siteid:
                insert_image_in_db(engine, siteid, g, xif, iptc)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('configfile')

    args = parser.parse_args()
    process(args.configfile)
