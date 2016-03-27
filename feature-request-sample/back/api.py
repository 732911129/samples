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

GET_ONLY = [ 'GET' ]
POST_ONLY = [ 'POST' ]
GET_POST = [ 'GET', 'POST' ]

media_paths = prefix( '/api/media',
    [
        path( '/type/<media_type><:/?>', 
            methods = GET_ONLY,
            handler = collection
          ),
        path( '/type/<media_type>/cursor/<cursor><:/?>', 
            methods = GET_ONLY,
            handler = collection
          ),
        path( '/type/<media_type><:/?>',
            methods = POST_ONLY,
            handler = instance
          ),
        path( '/type/<media_type>/id/<id><:/?>', 
            methods = GET_POST,
            handler = instance
          ),
      ]
  )

catch_all = path( 
    '/<path:.*>',
    methods = GET_POST,
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
