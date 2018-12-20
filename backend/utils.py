from flask import url_for
from config import DATA_IMAGES_PATH
from PIL import Image, ImageFont, ImageDraw, ImageOps
import os


def getImage(photo, prefixe, callback):
    #here = os.path.dirname(__file__)
    #newPath = './static/' + DATA_IMAGES_PATH
    #base_path = os.path.join(here,newPath)

    base_path = './static/' + DATA_IMAGES_PATH
    input_name = photo.get('path_file_photo')
    input_path = base_path + input_name
    if prefixe:
        output_name = prefixe + '_' + input_name
    else:
        output_name = input_name
    output_path = base_path + output_name
    image = Image.open(input_path)
    output_exists = os.path.exists(output_path)

    img = {
        'input_exists': os.path.exists(input_path),
        'output_name': output_name,
        'output_path': output_path,
        'output_url': url_for('static', filename=DATA_IMAGES_PATH + output_name),
        'image': image
    }
    if not(callback is None) and not(output_exists):
        try:
            callback(img)
        except Exception as exception:
            print('getImage Invalid image')
            print(exception)

    return img


def getThumbnail(photo, h = 150):
    def callback(img):
        #initW, initH = image.size
        #ratio = h / initH
        #image.resize((int(initW*ratio), h))
        image = img.get('image')
        image = ImageOps.fit(image, (h, h), Image.ANTIALIAS)
        image.save(img.get('output_path'))
    return getImage(photo, 'thumbnail' + str(h), callback)


def getMedium(photo):
    def callback(img):
        image = img.get('image')
        image.thumbnail((800, 800))
        image.save(img.get('output_path'))
    return getImage(photo, 'medium', callback)


def getLarge(photo, caption):
    h = 1200
    def callback(img):
        image = img.get('image')
        initW, initH = image.size
        ratio = h / initH
        image = image.resize((int(initW*ratio), h), Image.ANTIALIAS)
        image.save(img.get('output_path'))
        addCaption(img, image, caption)
    return getImage(photo, 'large', callback)

def getDownload(photo, caption):
    def callback(img):
        addCaption(img, img.get('image'), caption)
    return getImage(photo, 'download', callback)


def addCaption(img, img_src, text):
    font = ImageFont.truetype("./static/fonts/openSans.ttf", 16)
    if img.get('input_exists'):
        try:
            width, height = img_src.size
            img_dest = Image.new('RGB', (width, height + 36))
            img_dest.paste(img_src, (0, 0))
            draw = ImageDraw.Draw(img_dest)
            draw.text((10, height + 5), text, font=font, fill=(255, 255, 255, 255))
            img_dest.save(img.get('output_path'))
        except Exception:
            print('addCaption Invalid image')
