from google.appengine.api import namespace_manager

import logging

import services
import webapp2_custom

from webapp2_custom import (
    WSGIApplication as server, 
    Route as path,
    RequestHandler as api
  )

"""
  Namespace enabled requests for different data partitions. 
  So different application modules, can use this very same datastore service. 
  Data is isolated by partition. 
  The datastore api and services provided are the same for all partitions,
  and only change per the api version of this service.
"""
    
class endpoint( api ):
  def service( self, **kwargs ):
    """
    try:
      namespace_manager.set_namespace( kwargs[ 'partition' ] )
      services.resolve( 
        kwargs[ 'version' ], 
        kwargs[ 'service' ] ).service( self.request, self.response )
    except BaseException as e:
      logging.warn( 'unavailable', str( e ) )
      self.abort( 503 )
    """
    namespace_manager.set_namespace( kwargs[ 'partition' ] )
    services.resolve( 
      kwargs[ 'version' ], 
      kwargs[ 'service' ] ).service( self.request, self.response )

  def get( self, **kwargs):
    self.service( **kwargs )
    
  def post( self, **kwargs ):
    self.service( **kwargs )
    
routes = [
  path( name = 'echo-path',
      methods = ['GET','POST'], 
      template = '/usfe/server/api/<version>/<partition>/<service:(echo)><:/?><codes:.*>', 
      handler = endpoint 
     ),
  path( name = 'patch-path',
      methods = ['POST'], 
      template = '/usfe/server/api/<version>/<partition>/<service:patch><:/?>', 
      handler = endpoint 
    ),
  path( name = 'find-get-search-path',
      methods = ['GET'], 
      template = '/usfe/server/api/<version>/<partition>/<service:(find|get|search)>/<codes>', 
      handler = endpoint 
     )
]

threads = server( routes, debug = True )
