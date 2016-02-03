import v1

def get_self():
  import sys
  self = sys.modules[__name__]
  return self

def resolve( *names ):
  import logging
  try:
    return reduce( getattr, names, get_self() );
  except AttributeError as e:
    logging.warning( 'no such service', get_self() , names, e )
    raise e



