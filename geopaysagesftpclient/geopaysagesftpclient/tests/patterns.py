import unittest

from geopaysagesftpclient.patterns import (
    build_string_from_pattern,
    inputpattern_to_regex
)


class patternTestCases(unittest.TestCase):
    def testPatternMap(self):
        suite = [
            (r'{Y}', r'(?P<Y>\d{4})'),
            (r'{M}', r'(?P<M>\d{2})'),
            (r'{D}', r'(?P<D>\d{2})'),
            (r'toto', r'toto'),
            (r'{.+:name}', r'(?P<name>.+)'),
            (
                r'test/glacierblanc/{.+:viewpoint}/{Y}{M}{D}.+JPG',
                r'test/glacierblanc/(?P<viewpoint>.+)/(?P<Y>\d{4})(?P<M>\d{2})(?P<D>\d{2}).+JPG'
            )
        ]

        for pattern, regex in suite:
            self.assertEqual(
                regex,
                inputpattern_to_regex(pattern)
            )

    def testGroupFinding(self):
        import re
        test = [
            (
                r'{Y}{M}{D}',
                r'19600807',
                {'Y': '1960', 'M': '08', 'D': '07'}
            ),
            (
                r'{Y}-{M}-{D}',
                r'1960-08-07',
                {'Y': '1960', 'M': '08', 'D': '07'}
            ),
            (
                r'{D}/{M}/{Y}',
                r'07/08/1960',
                {'Y': '1960', 'M': '08', 'D': '07'}
            ),
            (
                r'{Y}/{M}/{D}/\w+\.jpeg',
                r'1960/08/07/filename.jpeg',
                {'Y': '1960', 'M': '08', 'D': '07'}
            ),
            (
                r'test/glacierblanc/{Y}/{M}/\w+{D}\.jpeg',
                r'test/glacierblanc/1960/08/filename_07.jpeg',
                {'Y': '1960', 'M': '08', 'D': '07'}
            ),
            (
                r'test/{\w+:site}/{\w+:viewpoint}/{Y}/{M}/{D}_.+JPG',
                r'test/glacierblanc/lateral/2020/12/05_toto.JPG',
                {'site':'glacierblanc', 'viewpoint':'lateral', 'Y': '2020', 'M': '12', 'D':'05'}
            )
        ]

        for (pattern, filepath, group) in test:
            self.assertDictEqual(
                group,
                re.fullmatch(inputpattern_to_regex(pattern), filepath).groupdict()
            )
    
    def test_filenaming(self):
        test = [
            (
                r'{site}',
                { 'site': 'glacierblanc' },
                'glacierblanc'
            ),
            (
                r'{site}/{filename}',
                { 'site': 'glacierblanc', 'filename': 'toto.jpeg' },
                'glacierblanc/toto.jpeg'
            ),
            (
                r'{site}/{date}/{filename}',
                { 'site': 'glacierblanc', 'filename': 'toto.jpeg' },
                'glacierblanc/__date__/toto.jpeg'
            ),
            (
                r'{site}/{Y}/{Y}_{filename}',
                { 'site': 'glacierblanc', 'filename': 'toto.jpeg', 'Y':'2020' },
                'glacierblanc/2020/2020_toto.jpeg'
            )
        ]

        for p, group, result in test:
            self.assertEqual(
                result,
                build_string_from_pattern(p, group)
            )
