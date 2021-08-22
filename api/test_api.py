import unittest
import os
import json
from app import app
from flask_caching import Cache
from flask import jsonify



class APITestCase(unittest.TestCase):
    """This class represents the city search test case"""
    def setUp(self):
        """Define test variables and initialize app."""
        self.app = app
        self.app.config.from_object('config')
        self.client = self.app.test_client
        self.cache = Cache()
        self.cache.init_app(app, config={"CACHE_TYPE": "SimpleCache"})

    # Test if searcy by city response is 200 ("OK")
    def test_weather_bycity(self):
        city = 'London'
        res = self.client().get('/weather/{}'.format(city))
        self.assertEqual(200, res.status_code)

    # Test if have any cached city
    def test_chached_cities(self):
        self.city = {"city_name":"Hello!"}
        self.cache.add('London', self.city, timeout=300) #5 minutes cache
        res = self.client().get('/weather')
        self.assertEqual(200, res.status_code)


# Make the tests conveniently executable
if __name__ == "__main__":
    unittest.main()
