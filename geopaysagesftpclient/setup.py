from setuptools import setup

setup(
    name='geopaysagesftpclient',
    version='1.0.0',
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
        'psycopg2==2.9.3',
    ],
    packages=setuptools.find_packages(),
    entry_points={
        'console_scripts': [
            'fetchsiteimages=geopaysagesftpclient.main:main'
        ]
    }
)
