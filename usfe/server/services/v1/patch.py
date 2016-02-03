from media import media

def parse_slot( slot_def ):
  """ FIXME : turn slots into their respective types """
  """ """
  kind = slot_def[ 'kind' ]
  string_value = slot_def[ 'string_value' ]
  if kind is 'string':
    return str( string_value )
  elif kind is 'unicode':
    return unicode( string_value )
  elif kind is 'integer':
    return int( string_value )
  elif kind is 'float':
    return float( string_value )
  else:
    return string_value

def apply_patch( entity, patch_slots ):
  """ turn slots into their respective types """
  """ populate the entity with these created values """
  for slot_name, slot_def in patch_slots.iteritems():
    patch_slots[ slot_name ] = parse_slot( slot_def )
  entity.populate( **patch_slots )

def patch_entities( entities, patches ):
  from google.appengine.ext import ndb
  entity_patches = zip( entities, patches )
  for entity, patch in entity_patches:
    entity.kind = patch[ 'kind' ]
    apply_patch( entity, patch[ 'slots' ] )
  return ndb.put_multi( entities )

def patch_existing( patches ):
  from google.appengine.ext import ndb
  keys = [ code_to_key( patch[ 'code' ] ) for patch in patches ]
  entities = ndb.get_multi( keys )
  keys = patch_entities( entities, patches ) 
  return keys

def prop_map():
  from google.appengine.ext import ndb
  property_map = {
    'string' : ndb.StringProperty,
    'integer' : ndb.IntegerProperty,
    'float' : ndb.FloatProperty
  }
  return property_map

def slot_defs_to_property_defs( slots ):
  from google.appengine.ext import ndb
  property_defs = {}
  property_map = prop_map()
  for slot_name, slot_def in slots.iteritems():
    property_defs[ slot_name ] = property_map[ slot_def[ 'kind' ] ]()
  return property_defs

def lookup_or_make_model( patch ):
  return media

def patch_new( patches ):
  """ each patch for a new contains a 'kind' slot to 
  name the kind of entity to be created """
  entities = [ media() for patch in patches ]
  keys = patch_entities( entities, patches ) 
  return keys

def report_patch( existing_keys, inserted_keys, kind = str ):
  return """
    EXISTING %(existing)s
    INSERTED %(inserted)s
  """ % { 'existing' : kind( existing_keys ), 'inserted' : kind( inserted_keys ) }

def service( request, response ):
  """ patch """
  import json
  import get
  patches = json.loads( request.body )
  """ 
    some patches may contain codes and reference existing entities
    others may contain no codes and reference entities to be created
    let's make two lists
  """
  patches_for_existing = filter( lambda x : 'code' in x, patches )
  patches_for_new  = filter( lambda x : 'code' not in x, patches )
  keys_of_existing = patch_existing( patches_for_existing )
  keys_of_inserted = patch_new( patches_for_new )

  report = report_patch( keys_of_existing, keys_of_inserted )
  response.write( report )

