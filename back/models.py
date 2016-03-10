from google.appengine.ext import ndb
import render

class Slot( ndb.Expando ):
  type_name = ndb.StringProperty()
  slot_name = ndb.StringProperty()
  value = ndb.TextProperty()

class Media( ndb.Model ):
  type_name = ndb.StringProperty()
  slots = ndb.StructuredProperty( Slot, repeated = True )

class Feature( Media ):
  type_name = 'feature'

class Features( Media ):
  type_name = 'features'
