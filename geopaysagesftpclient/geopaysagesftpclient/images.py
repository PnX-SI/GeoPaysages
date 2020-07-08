from iptcinfo3 import IPTCInfo, c_datasets
from PIL import Image, ImageFile, IptcImagePlugin
from PIL.IptcImagePlugin import getiptcinfo
ImageFile.LOAD_TRUNCATED_IMAGES = True

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