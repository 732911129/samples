import os
from webapp2 import (
    WSGIApplication as server,
    Route as path,
    RequestHandler as endpoint
  )
from models import Media

EXTENSIONS = {
  'css' : 'text/css',
  'html' : 'text/html',
  'txt' : 'text/plain',
  'jpg' : 'image/jpg',
  'png' : 'image/png',
  'ico' : 'image/x-icon'
}

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

class catchall_endpoint( endpoint ):
  def get( self, path = None ):
    name, ext = os.path.splitext( path )
    mime = 'text/html'
    ext = ext or ''
    ext = ext[1:]
    if ext in EXTENSIONS:
      mime = EXTENSIONS[ ext ]
    self.response.headers[ 'Content-Type' ] = mime
    self.response.write( Media.render( path = path ) )

  def post( self, path = None ):
    name, ext = os.path.splitext( path )
    mime = 'text/html'
    ext = ext or ''
    ext = ext[1:]
    if ext in EXTENSIONS:
      mime = EXTENSIONS[ ext ]
    self.response.headers[ 'Content-Type' ] = mime
    self.response.write( Media.render( path = path ) )

# An optimization is to group these paths under their common prefix

paths = [
  path( '/api/media/type/<media_type><:/?>', 
      methods=['GET'],
      handler=collection_endpoint
    ),
  path( '/api/media/type/<media_type>/cursor/<cursor><:/?>', 
      methods=['GET'],
      handler=collection_endpoint
    ),
  path( '/api/media/type/<media_type><:/?>',
      methods=['POST'],
      handler=instance_endpoint
    ),
  path( '/api/media/type/<media_type>/id/<id><:/?>', 
      methods=['GET','POST'],
      handler=instance_endpoint
    ),
  path( '/<path:.*>',
      methods=['GET','POST'],
      handler=catchall_endpoint
    )
]

app = server( paths, debug = True )

if __name__ == "__main__":
  app.run()

