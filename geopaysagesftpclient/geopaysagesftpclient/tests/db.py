from unittest import TestCase


class dbTestCase(TestCase):
    def test_engine(self):
        from geopaysagesftpclient.db import sqlalchemy_engine_from_config

        engine = sqlalchemy_engine_from_config('pytest.ini')

        self.assertEqual(
            1,
            engine.execute('select 1').scalar()
        )
