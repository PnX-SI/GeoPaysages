import os
import unittest

from geopaysagesftpclient import connect_for_test


class clientTestCases(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = connect_for_test()
        cls.site = 'glacierblanc'
        cls.outputdir = os.path.join('output', cls.site)
        
        if not os.path.isdir(cls.outputdir):
            os.makedirs(cls.outputdir)

    @classmethod
    def tearDownClass(cls):
        cls.client.close()

    def test_connection(self):
        '''Connection to the ftp host should be established'''
        self.assertIsNotNone(self.client.retrlines('LIST'))
        self.assertIsNotNone(self.client.getwelcome())

    def test_img_retrieval(self):
        input_pattern   = r'timelapse/glacierblanc/{\w+:vp}/{Y}{M}{D}/.+{ext}'
        output_pattern  = r'{site}/{vp}_{Y}{M}{D}_{filename}'

        for f,g in self.client.retrieve_images(self.site, input_pattern, output_pattern):
            self.assertTrue(
                os.path.isfile(f)
            )
