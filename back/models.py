from google.appengine.ext import ndb
import render

class Media( ndb.Model ):
  pass

class Feature( Media ):
  type_name = 'feature'
  pass

class Features( Media ):
  type_name = 'features'
  pass
