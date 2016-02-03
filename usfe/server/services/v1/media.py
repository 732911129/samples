from google.appengine.ext import ndb

class media( ndb.Expando ):
  kind = ndb.StringProperty()
  
