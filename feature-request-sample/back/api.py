from webapp2 import (
    WSGIApplication as server,
    Route as path
  )

from webapp2_extras.routes import (
    PathPrefixRoute as prefix 
  )

from endpoints import (
    collection_endpoint,
    instance_endpoint,
    catchall_endpoint
  )


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
