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
  def get( self, *args, **kwargs ):
    """ Return the list of best guesses 
    given the mask and those already tried """
    mask = args[ 0 ]
    tried = args[ 1 ]
    self.write( mask )
    self.write( '<br>' )
    self.write( tried )

paths = [
  (r'/query/mask/([\*\w]+)/(.*)', query )
]

app = server( paths )

if __name__ == "__main__":
  app.listen( 8080 )
  looper().start()
