from google.appengine.datastore.datastore_query import Cursor
from google.appengine.ext import ndb
import json
import render
import views

class Collection( object ):
  def __init__( self, media_type, models, cursor, more ):
    self.media_type = media_type
    self.models = models
    self.cursor = cursor
    self.more = more

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
  def _instance( cls, media_type = None, id = None, params = None, cursor = None ):
    if params and id == 'new':
      m = cls( media_type = media_type )
      for key in params.keys():
        value = params[ key ]
        s = Slot( slot_type = 'string', slot_name = key, value = value )
        m.slots.append( s )
      m.put()
      m.key_id = m.key.id()
      m.put()
      return m
    elif id: 
      try:
        longid = long( id )
      except:
        return None
      if not params:
        q = cls.get_by_id( longid )
        return q
      else:
        q = cls.get_by_id( longid )
        new_slots = []
        for key in params.keys():
          value = params[ key ]
          s = Slot( slot_type = 'string', slot_name = key, value = value )
          new_slots.append( s )
        q.slots = new_slots
        q.put()
        return q
    elif media_type:
      if cursor:
        cursor = Cursor( urlsafe = cursor )
      q, next_cursor, more = cls.                               \
        query( cls.media_type == media_type ).                  \
        fetch_page( 10, keys_only = True, cursor = cursor )     
      return Collection( media_type, q, next_cursor, more )
    else:
      return None

  @classmethod
  def render( cls, media_type = None, id = None, params = None, cursor = None ):
    if id == 'new' and not params:
      m = None
    else:
      m = cls._instance( media_type = media_type, id = id, params = params, cursor = cursor )
    if type( m ) is Collection:
      v = views[ media_type + 's' ] 
    else:
      v = views[ media_type ]
    if v:
      doc = render.imprint( m, v )
      return doc
    else:
      return views.view404
