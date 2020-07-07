import os
from unittest import TestCase


class ImageProcessTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cdir = os.path.dirname(__file__)
        cls.inputfile = os.path.join(cls.cdir, 'pt.jpg')
        cls.sizes = [
            (400, 600),
            (300, 500),
            (200, 400)
        ]

    @classmethod
    def ouput_file_name(cls, size):
        return os.path.join(
            cls.cdir,
            'pt_{0}_{1}.jpg'.format(size[0],size[1])
        )

    @classmethod
    def tearDownClass(cls):
        for size in cls.sizes:
            os.remove(cls.ouput_file_name(size))

    def test_image_process(self):
        from PIL import Image
        from geopaysagesftpclient import process_image

        for size in self.sizes:
            (ofile, exif, cr_notice) = process_image(self.inputfile, size, self.ouput_file_name(size))

            # Check that the file has been successfully created
            self.assertTrue(os.path.isfile(ofile))
            # Check that the size is correct
            self.assertEqual(
                size,
                Image.open(ofile).size
            )

            # Check that the copyright notice has been preserved
            self.assertIsNotNone(cr_notice)

            # Check that the exif has been preserved
            self.assertEqual(
                Image.open(self.inputfile).info.get('exif'),
                exif
            )
