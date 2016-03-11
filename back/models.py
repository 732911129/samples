from google.appengine.ext import ndb
import json
import render
import views

class Slot( ndb.Expando ):
  slot_type = ndb.StringProperty()
  slot_name = ndb.StringProperty()
  value = ndb.TextProperty()

class Media( ndb.Expando ):
  media_type = ndb.StringProperty()
  key_id = ndb.IntegerProperty()
  slots = ndb.StructuredProperty( Slot, repeated = True )

  def hasslot( self, name ):
    if self.__class__._properties.get( name ):
      return True
    for slot in self.slots:
      if slot.slot_name == name:
        return True
    return False

  def getslot( self, name ):
    if self.__class__._properties.get( name ):
      return self.__getattribute__( name )
    for slot in self.slots:
      if slot.slot_name == name:
          return slot.value
    return None

  @classmethod
  def _instance( cls, type = None, id = None, params = None, cursor = None ):
    if params and id == 'new':
      m = cls( media_type = type )
      for key in params.keys():
        value = params[ key ]
        s = Slot( slot_type = 'string', slot_name = key, value = value )
        m.slots.append( s )
      m.put()
      m.key_id = m.key.id()
      m.put()
      return m
    elif id and not params:
      print type, id, params, cursor
      longid = long( id )
      q = cls.get_by_id( longid )
      return q
    elif id and params:
      longid = long( id )
      q = cls.get_by_id( longid )
      new_slots = []
      for key in params.keys():
        value = params[ key ]
        s = Slot( slot_type = 'string', slot_name = key, value = value )
        new_slots.append( s )
      q.slots = new_slots
      q.put()
      return q
    else:
      return None

  @classmethod
  def render( cls, type = None, id = None, params = None, cursor = None ):
    m = cls._instance( type = type, id = id, params = params, cursor = cursor )
    v = views[ type ]
    if m and v:
      doc = render.imprint( m, v )
      return doc
    else:
      return views.get( '404' )
