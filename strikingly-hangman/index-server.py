import json
import tornado
import tornado.ioloop

looper = tornado.ioloop.IOLoop.instance

from tornado.web import (
  RequestHandler as endpoint,
  asynchronous as async,
  Application as server,
)

import index

class query( endpoint ):
  def post( self, *args, **kwargs ):
    """ Return the list of best guesses 
    given the mask and those already tried """
    body = json.loads( self.request.body )
    mask = body[ "word" ]
    tried = body[ "tried" ]
    self.write( index.guess( mask, tried ) )

paths = [
  (r'/guess', query )
]

app = server( paths )

if __name__ == "__main__":
  app.listen( 8888 )
  looper().start()
