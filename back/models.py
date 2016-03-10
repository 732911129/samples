from google.appengine.ext import ndb

class Slot( ndb.Expando ):
  type_name = ndb.StringProperty()
  slot_name = ndb.StringProperty()
  value = ndb.TextProperty()

class Media( ndb.Model ):
  slots = ndb.StructuredProperty( Slot, repeated = True )


