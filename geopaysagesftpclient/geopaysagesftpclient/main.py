import argparse

from geopaysagesftpclient import (
    connect,
    get_site_id,
    insert_image_in_db,
    process_image,
    read_config_file,
    retrieve_copyright_notice,
    sqlalchemy_engine_from_config
)


def process(config_filename):
    config = read_config_file(config_filename)
    engine = sqlalchemy_engine_from_config(config_filename)

    print('files will be saved in', config['outputdir'])

    for site in config.get('sites',[]):
        siteconfig = config['sites'][site]
        save_in_db = config['sites'][site].get('save_in_db')
        siteid = get_site_id(engine, site) if save_in_db else None
        print('site id', siteid)

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
            (_dest, xif, cp_notice) = process_image(f, siteconfig['resize'])

            if siteid:
                insert_image_in_db(engine, siteid, g, xif, cp_notice)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('configfile')

    args = parser.parse_args()
    process(args.configfile)
