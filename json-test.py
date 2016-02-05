import datetime
import json
import random
import time

from webapp2 import ( 

    WSGIApplication as server

    ,RequestHandler as api 

    ,Route as path 
  
  )
  
SOURCE_ALPHABET = unicode( 'ABCDEFGHIJKLMNOPQRSTUVWXYZ+*\\-:.0123456789/' )
CODE_LENGTH = 80

class Test( api ):
  def get( self ):
    """ return date and time and random as json """
    current_time = datetime.datetime.now()
    payload = {
            'epoch' : unicode( time.time() ),
            'date' : unicode( datetime.datetime.date( current_time ) ),
            'time' : unicode( datetime.datetime.time( current_time ) ),
            'random' : ''.join( map( lambda _ : random.choice( SOURCE_ALPHABET ), xrange( CODE_LENGTH ) ) )
        }
    self.response.headers[ 'Access-Control-Allow-Origin' ] = self.request.host_url 
    self.response.headers[ 'Content-Type' ] = 'application/json'
    self.response.write( json.dumps( payload ) )
    
app = server( [
    path( '/json-test', handler = Test )
  ], debug = True )
  
