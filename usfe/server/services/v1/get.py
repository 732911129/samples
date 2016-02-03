#codes = <key_code>,<key_code> and so on 
#key_code <name>:<id>:<name>:<id> and so on
#key_chain = [ <name>, <id>, <name>, <id> ] and so on
from media import media

def code_to_key( code ):
  from google.appengine.api import namespace_manager
  from google.appengine.ext import ndb
  key_chain = [ link if i%2 == 0 else int( link ) for i, link in enumerate( code.split( ':' ) ) ]
  key = ndb.Key( flat = key_chain )
  return key

def service( request, response ):
  from google.appengine.ext import ndb
  from google.appengine.api import namespace_manager
  import json
  response.headers[ 'Content-Type' ] = 'application/json'
  codes = request.route_kwargs[ 'codes' ]
  key_codes = codes.split( ',' )
  keys = [ code_to_key( key_code ) for key_code in key_codes ]
  entities = ndb.get_multi( keys )
  # do not apply any access control to entities yet
  # access_controlled_entities = access_control( entities, request )
  # response.write( json.dumps( access_controlled_entities ) )
  response.write( keys )
  response.write( entities )
  """ and that's that ! the get endpoint for everything """
