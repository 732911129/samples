from google.appengine.ext import ndb
from webapp2 import (
    WSGIApplication as server,
    Route as path,
    RequestHandler as endpoint
  )

class collection_endpoint( endpoint ):
  def get( self, type, cursor = None ):
    """Get the first or next page of the collection"""
    self.response.write( 'getting collection<br>' )
    self.response.write( type )
    self.response.write( '<br>' )
    self.response.write( cursor )

class instance_endpoint( endpoint ):
  def get( self, type, id ):
    """ Get a specific instance """
    pass

  def post( self, type, id = 'new' ):
    """ Create or update a specific instance """
    if id == 'new':
      self.response.write( 'creating<br>' )
      self.response.write( self.request.POST.mixed() )
    else:
      self.response.write( 'updating<br>' )
      self.response.write( self.request.POST.mixed() )

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
  path( '/api/model/type/<type>',
      handler=instance_endpoint, 
      methods=['POST'] 
    ),
  path( '/api/model/type/<type>', 
      handler=collection_endpoint, 
      methods=['GET'] 
    ),
  path( '/api/model/type/<type>/cursor/<cursor>', 
      handler=collection_endpoint, 
      methods=['GET'] 
    ),
  path( '/api/model/type/<type>/id/<id>', handler=instance_endpoint ),
  path( '/api/test', handler=test_endpoint )
]

app = server( paths, debug = True )

if __name__ == "__main__":
  app.run()

