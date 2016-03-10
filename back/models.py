from google.appengine.ext import ndb
import render
import json

class Slot( ndb.Expando ):
  slot_type = ndb.StringProperty()
  slot_name = ndb.StringProperty()
  value = ndb.TextProperty()

class Media( ndb.Expando ):
  media_type = ndb.ComputedProperty( lambda self: self.__class__.__name__ )
  key_id = ndb.IntegerProperty()
  slots = ndb.StructuredProperty( Slot, repeated = True )

  @classmethod
  def render( cls, id = None, params = None ):
    if params and id == 'new':
      m = cls()
      for key in params.keys():
        value = params[ key ]
        s = Slot( slot_type = 'string', slot_name = key, value = value )
        m.slots.append( s )
      m.put()
      m.key_id = m.key.id()
      m.put()
      return m
    elif id and not params:
      longid = long( id )
      q = cls.get_by_id( longid )
      return q
    else:
      return None

class Feature( Media ):
  pass

class Features( Media ):
  pass

