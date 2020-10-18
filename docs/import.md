# GeoPaysages FTP client

Script that fetches site images from FTP Servers

## Installation

From the folder `GeoPaysages/geopaysagesftpclient` (and inside your virtual env) 

#### For production

```sh
pip install .
```

#### For development

```sh
pip install -e ".[dev]"
```

Development mode is required for running *sphinx* and *pytest*.

Once the installation is completed, the script `fetchsiteimages` should be created in your virtual environment.

## Running the script

1. Set-up a configuration file, say, `config.ini` (see the [configuration](#configuration) section below)
2. Run the script `fetchsiteimages` by providing your config file

```sh
fetchsiteimages config.ini
```

## Configuration

1. Copy the template config file `config.ini.tpl` into `config.ini`
2. Fill in the configuration file

A sample configuration file is the following

```ini
[main]
outputdir = /home/mv/workspace/data/images
sites =
    glacier_blanc_lateral
    another_site

sqlalchemy.url = postgres://mv:$$$$@localhost/geopaysages

[sites.glacier_blanc_lateral]
host = ftp.mysite.fr
port = 21
user = photo
password = $$$$$$$
inputpattern = test/glacierblanc/lateral/{Y}{M}{D}/\w+{ext}
outputpattern = {site}_{Y}-{M}-{D}{ext}
resize = 800, 600
save_in_db = true
copyright_notice = © Observateurs des glaciers de France

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

### Configuration options

| Options                         | Description                                                  |
| ------------------------------- | ------------------------------------------------------------ |
| [main/outputdir]                | Directory in which the script will store the images          |
| [main/sites]                    | The list of sites to fetch the images for. If the *save_in_db* option is set to true for the site, then the site **must** exist in database. |
| [main/sqlalchemy.url]           | Connection string for the database                           |
| [sites.<site>/host]             | FTP connection host for the site                             |
| [sites.<site>/port]             | **Optional**. FTP connection port for the site. Defaults to 21 |
| [sites.<site>/user]             | **Optional**. FTP connection user for non-anonymous connections. |
| [sites.<site>/password]         | **Optional**. FTP connection password for non-anonymous connections. |
| [sites.<site>/inputpattern]     | python-regex-like pattern to describe the files to fetch and how to parse informations from their paths |
| [sites.<site>/outputpattern]    | python-regex-like pattern to describe how to name the fetched files from the parsed informations |
| [sites.<site>/resize]           | (width, height) value for image resizing. If this is not provided, the images will not be resized. |
| [sites.<site>/save_in_db]       | Boolean that indicates whether or not to register the images in the database |
| [sites.<site>/copyright_notice] | **Optional**. Copyright notice to add to the retrieved files IPTC data. This will be ignored if the fetched image already has a copyright notice. |

### Patterns

The **inputpattern** option specifies how to target the files to fetch from the FTP server and how to parse informations from their path. While the **outputpattern** specifies how you want to name the retrieved files using the parsed informations.

#### Example

Using the following configuration for a site, say, *glacierblanc_lateral*

```ini
[main]
outputdir = home/mv/Pictures
sites = 
	glacierblanc_lateral
...

[sites.glacierblanc_lateral]
inputpattern = images/\w+/{Y}-{M}-{D}/\w+_{h}_{m}_{s}{ext}
outputpattern = retrieved_images/{site}/{Y}_{M}_{D}/{h}_{m}_{s}{ext}
...
```

A file located at `images/testsite/2020-10-08/IMAGE_15_10_09.JPG` in the FTP server will match the inputpattern with the following *matchdict* 

```json
{
    "Y": 2020,
    "M": 10,
    "D": 08,
    "h": 15,
    "m": 10,
    "s": 09,
    "ext": ".JPG",
    "site": "glacierblanc_lateral",
    "filename": "IMAGE_15_10_09.JPG`",
    "path": "images/testsite/2020-10-08/file_15_10_09.JPG`"
}
```

and will be saved at `home/mv/Pictures/retrieved_images/glacierblanc_lateral/2020_10_08/15_10_09.jpg`

#### Built-in patterns

Additionally to the [python regex expressions](https://docs.python.org/3.6/library/re.html), you can use the script built-in expressions.

| Expression | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| {Y}        | Matches 4 digits for the year                                |
| {M}        | Matches the month as 2 digits (01, ..., 12)                  |
| {D}        | Matches the day as 2 digits (01 ,..., 31)                    |
| {h}        | Matches the hour as 2 digits (00, ..., 23)                   |
| {m}        | Matches the minutes as 2 digits (00, ..., 59)                |
| {s}        | Matches the seconds as 2 digits (00, ..., 59)                |
| {filename} | **outputpattern only**. Name of the retrieved file from the server |
| {path}     | **outputpattern only**. Path of the retrieved file from the server |
| {ext}      | Case-insensitive. Matches `.jpg`, `.jpeg`, `.git`, `.png`, `.bmp` |
| {site}     | Matches the current site name                                |

#### Defining custom match group

You can define custom match group using the syntax `{exp:name}` where `exp` is a regular expression and `name` is the key for the match.

##### Example

Using the following configuration

```ini
inputpattern = images/{\w+:author}/{Y}-{M}-{D}/\w+{ext}
outputpattern = retrieved_images/{site}/{Y}_{M}_{D}_{author}{ext}
```

a file located at `images/C Junot/2020-10-08/image10001.jpg` will match the inputpattern with the matchdict 

```json
{
    "author": "C Junot",
    "Y": 2020,
    "M": 10,
    "D": 08,
    "ext": ".jpg",
    "site": "glacierblanc_lateral",
    "filename": "image10001.jpg",
    "path": "images/mv/2020-10-08/images10001.jpg"
}
```

and will be saved to `retrieved_images/glacierblanc_lateral/2020_10_08_c_junot.jpg`.



> Note: The outputpattern result will always be lower-cased. Additionally, white-spaces and special characters will be replaced

For example, given the following configuration

```ini
inputpatter = images/.+
outputpatter = retrieved_images/{filename}
```

A file located at `images/Some filé name.JPG` will be saved as `retrieved_images/some_file_name.jpg`



#### Troubleshooting

##### Group name redefinition error

```python
re.error: redefinition of group name
```

This happens when you use the same group name twice in the `inputpattern`. For example, the following configuration will result of an error

```ini
inputpattern = images/{\w+:author}/{Y}-{M}-{D}/\w+_{Y}-{M}-{D}{ext}
```

as this configuration is requiring to parse the same information from different substrings of the input files.



## Testing (dev installation mode only)

1. copy the file `pytest.ini.tpl` into `pytest.ini`
2. configure the `pytest.ini` file (This file is required to be named `pytest.ini`).
3. run `pytest -s -v` from a terminal. 
