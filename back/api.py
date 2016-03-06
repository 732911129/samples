from google.appengine.ext import ndb
from webapp2 import (
    WSGIApplication as server,
    Route as path,
    RequestHandler as endpoint
  )
import os
import paths
import files

instance_blank = files.read( paths.instance )
collection_blank = files.read( paths.collection )

class collection_endpoint( endpoint ):
  def get( self, type, cursor = None ):
    """Get the first or next page of the collection"""
    self.response.write( collection_blank )

class instance_endpoint( endpoint ):
  def get( self, type, id ):
    """ Get a specific instance """
    if id == 'blank':
      self.response.write( instance_blank )
    else:
      pass

  def post( self, type, id = 'new' ):
    """ Create or update a specific instance """
    if id == 'new':
      self.response.write( 'creating<br>' )
      self.response.write( self.request.POST.mixed() )
    else:
      self.response.write( 'updating<br>' )
      self.response.write( self.request.POST.mixed() )

# An optimization is to group these paths under their common prefix
paths = [
  path( '/api/model/type/<type><:/?>', 
      methods=['GET'],
      handler=collection_endpoint
    ),
  path( '/api/model/type/<type>/cursor/<cursor><:/?>', 
      methods=['GET'],
      handler=collection_endpoint
    ),
  path( '/api/model/type/<type><:/?>',
      methods=['POST'],
      handler=instance_endpoint
    ),
  path( '/api/model/type/<type>/id/<id><:/?>', 
      methods=['GET','POST'],
      handler=instance_endpoint
    )
]

app = server( paths, debug = True )

if __name__ == "__main__":
  app.run()

