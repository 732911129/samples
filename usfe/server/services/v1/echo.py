def service( request, response ):
  import json
  response.headers[ 'Content-Type' ] = 'text/plain'
  response.write( "\nMETHOD " )
  response.write( request.method )
  response.write( "\nURI " )
  response.write( request.uri )
  response.write( "\nARGS " )
  response.write( request.route_args )
  response.write( "\nKWARGS " )
  response.write( request.route_kwargs )
  response.write( "\nHEADERS " )
  response.write( request.headers )
  response.write( "\nBODY " )
  response.write( request.body )
  response.write( "\nREGISTRY " )
  response.write( request.registry )
  response.write( "\nREQUEST DICT " )
  response.write( request.__dict__ )
