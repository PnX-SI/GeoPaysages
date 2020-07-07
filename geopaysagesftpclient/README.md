# Geo-paysages FTP client
Script that fetch site images from FTP Servers

## Installation
From this folder (and inside your virtual env) 

#### For production

```sh
pip install .
```

#### For development

```sh
pip install -e ".[dev]"
```

Development mode is required for running *sphinx* and *pytest*.

## Testing (dev install only)

1. copy the file `pytest.ini.tpl` into `pytest.ini`
2. configure the `pytest.ini` file.
3. execute `pytest -s -v` 

## Running the script

1. Copy the file `config.ini.tpl` into `config.ini`
2. Run the script `fetchsiteimages` by providing your config file

```sh
fetchsiteimages config.ini
```

## Configuration options

The script is run with a configuration file. A sample configuration file is the following

```ini
[main]
outputdir = /home/mv/workspace/data/images
sites =
    glacier_blanc_lateral
    another_site

sqlalchemy.url = postgres://mv:$$$$@localhost/geopaysages

[sites.glacier_blanc_lateral]
host = ftp.ecrins-parcnational.fr
port = 3921
user = photo
password = $$$$$$$
inputpattern = test/glacierblanc/lateral/{Y}{M}{D}/\w+{ext}
outputpattern = {site}_{Y}-{M}-{D}{ext}
resize = 800, 600
save_in_db = true
copyright_notice = ©Observateurs des glaciers de France

[sites.another_site]
host = ftp.public.fr
port = 21
user = 
password =
inputpatter = images/{Y}{M}{D}/.+{ext}
outputpatter = siteimages/{site}/{Y}-{M}-{D}/{filename}
resize =
save_in_db = false
copyright_notice = 
```

### Config description

| Options               | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| outputdir             | Directory in which the script will store the images          |
| sites                 | The list of sites to fetch the images for. If the *save_in_db* option is set to true for the site, then the site **must** exist in database. |
| sqlalchemy.url        | Connection string for the database                           |
| [sites.site/host]     | FTP connection host for the site                             |
| [sites.site/port]     | **Optional**. FTP connection port for the site. Defaults to 21 |
| [sites.site/user]     | **Optional**. FTP connection user for non-anonymous connections. |
| [sites.site/password] | **Optional**. FTP connection password for non-anonymous connections. |
| inputpattern          | python-regex-like pattern to describe the files to fetch and how to parse informations from their paths |
| outputpattern         | python-regex-like pattern to describe how to name the fetched files from the parsed informations |
| resize                | (width, height) value for image resizing. If this is not provided, the images will not be resized. |
| save_in_db            | Boolean that indicates whether or not to register the images in the database |
| copyright_notice      | **Optional**. Copyright notice to add to the retrieved files IPTC data. This will be ignored if the fetched image already has a copyright notice. |

### Patterns

The **inputpattern** option specifies how to target the files to fetch from the FTP server and how to parse informations from their path. While the **outputpattern** specifies how to name the retrieved files using the parsed informations.

#### Example

Using the following configuration for a site, say, *glacierblanc_lateral*

```ini
inputpattern = images/\w+/{Y}-{M}-{D}/\w+{ext}
outputpattern = retrieved_images/{site}/{Y}_{M}_{D}{ext}
```

A file located at `images/testsite/2020-10-08/img10001.JPG` in the FTP server will match the inputpattern with the following *matchdict* 

```json
{
    "Y": 2020,
    "M": 10,
    "D": 08,
    "ext": ".JPG",
    "site": "glacierblanc_lateral",
    "filename": "img10001.JPG",
    "path": "images/testsite/2020-10-08/img10001.JPG"
}
```

and will be saved at `retrieved_images/glacierblanc_lateral/2020_10_08.JPG`

#### Built-in patterns

Additionally to the [python regex expressions](https://docs.python.org/3.6/library/re.html), you can use the script built-in expressions.

| Expression | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| {Y}        | Matches 4 digits for the year                                |
| {M}        | Matches 2 digits for the month                               |
| {D}        | Matches 2 digit for the day                                  |
| {filename} | **outputpattern only**. Name of the retrieved file from the server |
| {path}     | **outputpattern only**. Path of the retrieved file from the server |
| {ext}      | Case-insensitive. Matches `.jpg`, `.jpeg`, `.git`, `.png`, `.bmp` |
| {site}     | Matches the current site name                                |

#### Defining custom match group

You can define custom match group using the syntax `{exp:name}` where `exp` is a regular expression and `name` is the key for the match.

##### Example

Using the following configuration for a site, say, *glacierblanc_lateral* 

```ini
inputpattern = images/{\w+:author}/{Y}-{M}-{D}/\w+{ext}
outputpattern = retrieved_images/{site}/{Y}_{M}_{D}_{author}{ext}
```

a file located at `images/mv/2020-10-08/image10001.jpg` will match the inputpattern with the matchdict 

```json
{
    "author": "mv",
    "Y": 2020,
    "M": 10,
    "D": 08,
    "ext": ".jpg",
    "site": "glacierblanc_lateral",
    "filename": "image10001.jpg",
    "path": "images/mv/2020-10-08/images10001.jpg"
}
```

and will be saved to `retrieved_images/glacierblanc_lateral/2020_10_08_mv.jpg`.