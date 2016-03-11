from webapp2 import (
    WSGIApplication as server,
    Route as path,
    RequestHandler as endpoint
  )
from models import Media

class collection_endpoint( endpoint ):
  def get( self, media_type, cursor = None ):
    """Get the first or next page of the collection"""
    self.response.write( Media.render( media_type = media_type, cursor = cursor ) )

class instance_endpoint( endpoint ):
  def get( self, media_type, id ):
    """ Get a specific instance """
    self.response.write( Media.render( media_type = media_type, id = id ) )

  def post( self, media_type, id = 'new' ):
    """ Create or update a specific instance """
    self.response.write( Media.render( media_type = media_type, id = id, params = self.request.POST.mixed() ) )

# An optimization is to group these paths under their common prefix
paths = [
  path( '/api/model/type/<media_type><:/?>', 
      methods=['GET'],
      handler=collection_endpoint
    ),
  path( '/api/model/type/<media_type>/cursor/<cursor><:/?>', 
      methods=['GET'],
      handler=collection_endpoint
    ),
  path( '/api/model/type/<media_type><:/?>',
      methods=['POST'],
      handler=instance_endpoint
    ),
  path( '/api/model/type/<media_type>/id/<id><:/?>', 
      methods=['GET','POST'],
      handler=instance_endpoint
    )
]

app = server( paths, debug = True )

if __name__ == "__main__":
  app.run()

