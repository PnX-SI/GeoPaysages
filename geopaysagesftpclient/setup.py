from setuptools import setup

setup(
    name='geopaysagesftpclient',
    version='0.1.0',
    description='Geopaysage FTP Client for site image fetching',
    long_description='Script that fetches sites image from ftp servers',
    classifiers=[
        'Programming Language :: Python'
    ],
    author='MV',
    author_email='el-makki_voundy@natural-solutions.eu',
    extras_require={
        'dev': [
            'sphinx',
            'pytest',
            'pytest-cov'
        ]
    },
    install_requires=[
        'IPTCInfo3',
        'pillow',
        'sqlalchemy',
        'psycopg2==2.7.5',
        'psycopg2-binary==2.7.5'
    ],
    entry_points={
        'console_scripts': [
            'fetchsiteimages = geopaysagesftpclient.main:main'
        ]
    }
)
