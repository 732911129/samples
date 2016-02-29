from google.appengine.ext import ndb
from webapp2 import (
    WSGIApplication as server,
    Route as path,
    RequestHandler as endpoint
  )

class collection_endpoint( endpoint ):
  pass

class instance_endpoint( endpoint ):
  pass

class role_endpoint( endpoint ):
  pass

class test_endpoint( endpoint ):
  def get( self, **kwargs ):
    self.response.write( 'GET' )
    self.response.write( kwargs )

  def post( self, **kwargs ):
    self.response.write( 'POST' )
    self.response.write( kwargs )

# An optimization is to group these paths under their common prefix
paths = [
  path( '/api/model/type/<type>/role/<role>', handler=role_endpoint ),
  path( '/api/model/type/<type>/id/<id>', handler=instance_endpoint ),
  path( '/api/model/type/<type>', handler=collection_endpoint ),
  path( '/api/test', handler=test_endpoint )
]

app = server( paths, debug = True )

if __name__ == "__main__":
  app.run()

