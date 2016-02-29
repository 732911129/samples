from google.appengine.ext import ndb
from webapp2 import (
    WSGIApplication as server,
    Route as path,
    RequestHandler as endpoint
  )

class collection_handler( endpoint ):
  pass

class instance_handler( endpoint ):
  pass

class role_handler( endpoint ):
  pass

class test_handler( endpoint ):
  def get( self, **kwargs ):
    self.response.write( 'GET' )
    self.response.write( kwargs )

  def post( self, **kwargs ):
    self.response.write( 'POST' )
    self.response.write( kwargs )

# An optimization is to group these paths under their common prefix
routes = [
  path( '/api/model/type/<type>/role/<role>', handler=role_endpoint ),
  path( '/api/model/type/<type>/id/<id>', handler=instance_endpoint ),
  path( '/api/model/type/<type>', handler=collection_endpoint ),
  path( '/api/test', handler=test_handler )
]

app = server( paths, debug = True )

if __name__ == "__main__":
  app.run()

