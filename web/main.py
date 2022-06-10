import logging
import json
from datetime import datetime, timedelta
import hmac
import os
import time
import urllib
import csv
from google.appengine.api.app_identity import app_identity

import webapp2
from google.appengine.api import urlfetch
import jwt

from google.appengine.ext import vendor

# Add any libraries installed in the "lib" folder.
vendor.add('lib')

SERVER_KEY = '49ab023f-6feb-4a7c-a602-6b58e7573dca'


class ResultException(Exception):
    def __init__(self, data):
        super(ResultException, self).__init__()
        self.data = data


def return_error(error_message, detail=None, code=None):
    payload = {'success': False, 'msg': error_message}
    if detail:
        payload['detail'] = detail
    if code:
        payload['code'] = code
    raise ResultException(json.dumps(payload))


class RequestHandler(webapp2.RequestHandler):
    """Common anscestor of application request handlers"""

    whitelist = [
        'http://www.freevehicletracking.com',
        'https://www.freevehicletracking.com',
    ]
    vtsUrl = 'http://freevtsdev.gpsengine.net'
    vtsProvider = 'freevts'
    vtsSecret = 'Fr33VT$'

    def allowOrigin(self, whitelist=None):
        if whitelist is None:
            whitelist = self.whitelist
        origin = self.request.headers.get('Origin')
        if origin in whitelist:
            self.response.headers.add('Access-Control-Allow-Origin', origin)

    def allowVerbs(self, verbs, whitelist=None):
        self.allowOrigin(whitelist)
        self.response.headers.add('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        self.response.headers.add('Access-Control-Allow-Methods', verbs)

    def writejson(self, obj):
        self.response.out.write(json.dumps(obj))

    def makeCookie(self, email):
        data = {'email': email}
        msg = json.dumps(data, sort_keys=True)
        crypt = hmac.HMAC(SERVER_KEY, msg).hexdigest()
        data['crypt'] = crypt
        return json.dumps(data, sort_keys=True)

    def decodeCookie(self, cookie):
        data = json.loads(cookie)
        crypt = data.get('crypt')
        data.pop('crypt', None)
        msg = json.dumps(data, sort_keys=True)
        if crypt == hmac.HMAC(SERVER_KEY, msg).hexdigest():
            return data
        return None  # invalid signature

    def setCookie(self, email):
        data = self.makeCookie(email)
        expires = datetime.now() + timedelta(days=30)
        self.response.set_cookie('session', data, expires=expires, path='/')

    def readCookie(self):
        session = self.request.cookies.get('session')
        if not session:
            return None
        return self.decodeCookie(session)

    def vtsRequest(self, verb, path, body='', **kws):
        salt = int(time.time())
        url = self.vtsUrl + path
        stringToSign = str(salt) + ' ' + verb + ' ' + path + ' ' + body
        sig = hmac.HMAC(self.vtsSecret, stringToSign).hexdigest()
        query = {
            'provider': self.vtsProvider,
            'signature': sig,
            'salt': salt,
        }
        query.update(kws)
        query = urllib.urlencode(query)

        headers = {'Content-Type': 'application/json'}
        if verb == 'GET':
            verb = urlfetch.GET
            headers = {}
        elif verb == 'POST':
            verb = urlfetch.POST
        elif verb == 'PUT':
            verb = urlfetch.PUT
        else:
            raise ValueError('Unsupported verb: %r' % verb)

        result = urlfetch.fetch(url=self.vtsUrl + path + '?' + query, method=verb, payload=body, headers=headers)
        content = result.content
        if content:
            content = json.loads(content)
        return result.status_code, content


class GetCountries(RequestHandler):
    def get(self):
        """Read the countries.csv file as is an json serialize it with
           with the fields we are interested in"""

        csvfile = open('data/countries.csv')
        reader = csv.DictReader(csvfile)
        fieldnames = ('Sort Order', 'Name', 'Code')

        output = []

        for each in reader:
            row = {}
            row["Sort"] = each["Sort Order"]
            row["Code"] = each["Code"]
            row["Name"] = each["Name"]
            output.append(row)
        self.writejson(sorted(output, key=lambda result: result['Name']))


class Index(RequestHandler):
    """Access direct to app.freevehicletracking.com is not supported, redirect to marketing website"""

    def get(self):
        return self.redirect('http://www.freevehicletracking.com')


class FreeVTSIndex(RequestHandler):
    def get(self):
        index_path = 'freevts/index.html'

        local = os.environ['SERVER_SOFTWARE'].startswith('Development')

        # TODO: check if this works in production
        if local or app_identity.get_application_id() != 'freevtsdev':
            newrelic_path = 'new-relic-dev.html'
        else:
            newrelic_path = 'new-relic.html'

        index = self.load_template(index_path)
        newrelic = self.load_template('freevts/templates', newrelic_path)
        PLACEHOLDER = '${newRelic}'
        if PLACEHOLDER not in index:
            raise Exception('NewRelic placeholder is not found')

        index = index.replace(PLACEHOLDER, newrelic)

        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write(index)

    def load_template(self, *path):
        base = os.path.dirname(__file__)
        with open(os.path.join(base, *path)) as f:
            return f.read()


class SignIn(RequestHandler):
    def get(self):
        self.allowOrigin()
        token = self.request.get('token')
        redirect = self.request.get('redirect', '/freevts/index.html')
        self.response.set_cookie('token', value=token, max_age=5 * 60, overwrite=True)
        return webapp2.redirect(str(redirect), response=self.response)

    def options(self):
        self.allowVerbs('GET')


class SignOut(RequestHandler):
    def get(self):
        self.allowOrigin()
        raise Exception('Not implemented')

    def options(self):
        self.allowVerbs('GET')


class RenewToken(RequestHandler):
    def get(self):
        raise Exception('Not implemented')


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': SERVER_KEY,
    'cookie_args': {
        'max_age': 2 * 60 * 60,
        'httponly': True,
        #     TODO: allow only HTTPS
        #     'secure': true
    }
}

app = webapp2.WSGIApplication([
    (r'/', Index),
    (r'/signin', SignIn),
    (r'/signout', SignOut),
    (r'/token/renew', RenewToken),
    webapp2.Route(r'/freevts/index.html', handler=FreeVTSIndex, name='index'),
    (r'/countries', GetCountries),
], debug=True, config=config)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
