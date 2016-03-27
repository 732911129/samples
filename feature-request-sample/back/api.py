from webapp2 import (
    WSGIApplication as server,
    Route as path
  )

from webapp2_extras.routes import (
    PathPrefixRoute as prefix 
  )

from endpoints import (
    collection_endpoint as collection,
    instance_endpoint as instance,
    catchall_endpoint as catchall
  )


media_paths = prefix( '/api/media',
    [
        path( '/type/<media_type><:/?>', 
            methods = [ 'GET' ],
            handler = collection
          ),
        path( '/type/<media_type>/cursor/<cursor><:/?>', 
            methods = [ 'GET' ],
            handler = collection
          ),
        path( '/type/<media_type><:/?>',
            methods = [ 'POST' ],
            handler = instance
          ),
        path( '/type/<media_type>/id/<id><:/?>', 
            methods = [ 'GET','POST' ],
            handler = instance
          ),
      ]
  )

catch_all = path( 
    '/<path:.*>',
    methods = [ 'GET','POST' ],
    handler = catchall
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
