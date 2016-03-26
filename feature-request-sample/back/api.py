import os

from webapp2 import (
    WSGIApplication as server,
    Route as path,
    RequestHandler as endpoint
  )

from webapp2_extras.routes import (
    PathPrefixRoute as prefix 
  )

from models import Media

EXTENSIONS = {
    '.css' : 'text/css',
    '.html' : 'text/html',
    '.txt' : 'text/plain',
    '.jpg' : 'image/jpg',
    '.png' : 'image/png',
    '.ico' : 'image/x-icon'
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
  def render_path( self, path = None ):
    name, ext = os.path.splitext( path )
    try:  
      mime = EXTENSIONS[ ext ]
    except KeyError:
      mime = 'text/html'
    self.response.headers[ 'Content-Type' ] = mime
    self.response.write( Media.render( path = path ) )

  def get( self, path = None ):
    self.render_path( path )

  def post( self, path = None ):
    self.render_path( path )

media_paths = prefix( '/api/media',
    [
        path( '/type/<media_type><:/?>', 
            methods=['GET'],
            handler=collection_endpoint
          ),
        path( '/type/<media_type>/cursor/<cursor><:/?>', 
            methods=['GET'],
            handler=collection_endpoint
          ),
        path( '/type/<media_type><:/?>',
            methods=['POST'],
            handler=instance_endpoint
          ),
        path( '/type/<media_type>/id/<id><:/?>', 
            methods=['GET','POST'],
            handler=instance_endpoint
          ),
      ]
  )

catch_all = path( 
    '/<path:.*>',
    methods=['GET','POST'],
    handler=catchall_endpoint
  )

app = server( 
    [
        media_paths,
        catch_all
      ]
    , debug = True 
  )

if __name__ == "__main__":
  app.run()

