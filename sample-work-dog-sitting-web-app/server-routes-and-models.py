from google.appengine.ext import ndb
from google.appengine.api import search
import webapp2
import json
import logging

from webapp2 import (
  
    WSGIApplication as server,

    Route as path,

    RequestHandler as api

  )

from google.appengine.ext.ndb import (

    get_multi as keys_to_entities,

    StringProperty as str_slot,

    IntegerProperty as int_slot,

    KeyProperty as key_slot,

    BlobProperty as blob_slot,

    StructuredProperty as struct_slot,

    TextProperty as text_slot

  )


""" The intent of this Python file is to display
the data models of the application, and the logic they express or suggest. 
The intent of that is to essentially convey that the 
application is determined by its data models, and the way the data models are designed
is core to the application. This is for comprehension, both for developers and humans who are 
clients of this application. Possible ways the application will work
are obvious from considering the data models and the logic they encode and suggest.

Also, the intent is obviously to show you how I think about, model and implement this, the considerations I make, and the way I make them.
"""

MAX_PHOTOS = 5

DOGS_RATE_SITTING = {
    'SO-SATISFIED' : 'SO-SATISFIED',
    'NOT-ENOUGH-FOOD' : 'NOT-ENOUGH-FOOD',
    'BORING' : 'BORING',
    'SCARY' : 'SCARY'
  }

FLAG_CHOICES = {
    'HIDE-AND-REVIEW' : 'HIDE-AND-REVIEW',
    'REVIEWED-VIOLATES-NOTIFIED' : 'REVIEWED-VIOLATED-NOTIFIED',
    'UNFLAGGED' : 'UNFLAGGED'
  }

HUMANS_RATE_SITTERS = {
    'EVERYTHING-GREAT' : 'EVERYTHING-GREAT',
    'SOME-PROBLEMS' : 'SOME-PROBLEMS',
    'TERRIBLE' : 'TERRIBLE',
    'PUNCTUALITY-PROBLEMS' : 'PUNCTUALITY-PROBLEMS',
    'DOGLOSS-PROBLEMS' : 'DOGLOSS-PROBLEMS'
  }

RECURRING_SITTING_STATUS = {
    'ONE-OFF-ONLY' : 'ONE-OFF-ONLY',
    'RECURRING-FOR-RIGHT-SITTER' : 'RECURRING-FOR-RIGHT-SITTER',
    'RECURRING-AND-CURRENTLY-PAUSED' : 'RECURRING-AND-CURRENTLY-PAUSED',
    'RECURRING' : 'RECURRING' 
  }

SIT_PROVIDER_STATUS = {
    'DOES-NOT-AND-DOES-NOT-WANT-TO' : 'DOES-NOT-AND-DOES-NOT-WANT-TO',
    'DOES-NOT-AND-MIGHT-WANT-TO' : 'DOES-NOT-AND-MIGHT-WANT-TO',
    'DOES-NOT-AND-WANTS-TO' : 'DOES-NOT-AND-WANTS-TO',
    'DOES-SIT' : 'DOES-SIT'
  }

SITTER_RATES_DOGS_AND_HUMANS = {
    'EVERYTHING-GREAT' : 'EVERYTHING-GREAT',
    'SOME-PROBLEMS' : 'SOME-PROBLEMS',
    'TERRIBLE' : 'TERRIBLE',
    'PAYMENT-PROBLEMS' : 'PAYMENT-PROBLEMS'
  }

TRANSACTION_STATES = {
  'AMOUNT-DISPUTE' : 'AMOUNT-DISPUTE',
  'SERVICE-RENDERED-DISPUTE' : 'SERVICE-RENDERED-DISPUTE',
  'PAID' : 'PAID',
  'PARTIALLY-PAID' : 'PARTIALLY-PAID',
  'OUTSTANDING-SAID-WILL-PAY' : 'OUTSTANDING-SAID-WILL-PAY',
  'OUTSTANDING-REFUSES-TO-PAY' : 'OUTSTANDING-REFUSES-TO-PAY'
}

""" This super class of the entity classes also contains code to handle requests.
So one model per route."""

class datastore_entity( ndb.Model ):
  def __repr__( self ):
    """ convert a class instance to a json string
    removing any properties blocked by the access role given """
    cls_name = self.__class__.__name__
    if access_role is not None:
      try:
        properties_excluded_by_role = self.excluded_properties[ access_role ]
        this_dict = self.to_dict()
        map( lambda blocked : del this_dict[ blocked ], properties_excluded_by_role )
        return json.dumps( this_dict )
      except BaseException:
        receipt = { 'error' : 'error when creating json string from entity' }
        logging.warning( "failing to project and create json entity, info : %s" % unicode(
                          { 'cls' : cls_name, 'slots' : this_dict, 
                          'role' : access_role, 'excluded' : properties_excluded_by_role } ) )
        return receipt
    else:
      return { 'error' : 'no access role to enable access to %s' % cls_name }

  def __str__( self ):
    return str( self.__repr__() )

  def __unicode__( self ):
    return unicode( self.__repr__() )

""" decorators """

# json io makes a request method json input json output and throws if this results in an error

def json_io():
  pass

# in session makes sure we are in session and informs the client to log in if we are not
# it also fulfills the session role variable

def in_session():
  pass

class endpoint( api ):
  """ codes are a comma separated list of entity ids pairs in the format
  kind:id:kind:id and so on.
  We could have chosen '/', yet we think ':' looks cooler.
  """

  @json_io
  @in_session
  def get( self, codes = None ):
    receipt = None
    if codes is not None:
      try:
        receipt = keys_to_entities( [ ndb.Key( flat = code.split( ':' ) 
                                         for code in codes.split(',') ] )
        map( lambda entity : entity.access_role = session_role, receipt )
      except:
        receipt = { 'error' : 'unable to access %s' % codes }
    else:
      receipt = { 'error' : 'no request was made to the api' }
    if 'error' in receipt:
      logging.warn( receipt[ 'error' ] )
    self.response.write( json.dumps( receipt ) )

  @json_io
  @in_session
  def post( self ):
    """ code to read the response body loaded from json
    and add or patch the entities requested """
    pass

""" Some classes are required by others that follow,
and so are placed preceding those which depend on them """

""" This includes the following
Interfaces / Prototypes that can be implemented by models to extend 
functionality and expressiveness in consistent ways """

class HoistedNoteGroup( datastore_entity ):
  """ the purpose of this class is to hoist the definition of note
    which otherwise introduces a cyclic dependency,
    Note -> Human -> photographable -> flaggable -> Note
    If we make flaggable -> HoistedNoteGroup
    and Note -> HoistedNoteGroup
    Then we are okay. 
    How we use this is that admin flag notes has a single hoisted note as the ancestor
    of all notes it links to. Then to get the admin flag notes, 
    we do an ancestory query with this hoisted note set as the ancestor. 
    Writes within an ancestor group are usually more expensive than writes to entities that aren't
    in and ancestor group, and the advice is to keep entity groups small. 
    At this time that seems an okay strategy to avoid the cyclic dependency 
    and keep our data model the determining factor of our implementation
    ( and not the factor being determined by our implementation )
    because we don't expect that admins will be adding lots of flag notes to a single flagged
    entity in quick succession ( the actual limit is one write per second ).
 
  """
  pass

class flaggable( ):
  flagged = ndb.StringProperty( choices = FLAG_CHOICES.values(), default = FLAG_CHOICES[ 'UNFLAGGED' ] )
  admin_flag_notes = ndb.KeyProperty( HoistedNoteGroup )

class photographable( flaggable ):
  photos = ndb.BlobProperty( repeated = True, validator = 
    # limit photos to MAX_PHOTOS
    lambda _, photo_list : photo_list[ : MAX_PHOTOS ] )

class reputationMeasurable( ):
  positive_reviews = ndb.IntegerProperty( default = 1 )
  negative_reviews = ndb.IntegerProperty( default = 0 )
  other_metric = ndb.FloatProperty( default = 0.5 )
  flags = ndb.IntegerProperty( default = 0 )
  reputation_score = ndb.ComputedProperty( 
      lambda self : ( self.positive_reviews - self.negative_reviews - self.flags ) * self.other_metric
    )

class Address( datastore_entity ):
  """ 
    the reason we construct the address like this is to make it easier to input
    and also find. Once someone can see a geo pt of where the address is, all they really
    need is street name, street number and any other finding instructions, such as including,
    things like, "Floor 10 flat B ( it's behind the elevator column )", or, "Down the tiny lane, 
    next to the 7-11, turn first right, then up the stairs to the flat" 
  """
  geo_pt = ndb.GeoPtProperty()
  street_name = ndb.StringProperty()
  street_number = ndb.StringProperty()
  finding_instructions = ndb.StringProperty()

class Dog( datastore_entity, reputationMeasurable, photographable ):
  """ a dog's entry, can have photos, and therefore we specify a flag property """
  name = ndb.StringProperty()
  breed = ndb.StringProperty()
  birthday = ndb.DateProperty()

class Human( datastore_entity, reputationMeasurable, photographable ):
  """ a human's entry, can have photos, and therefore we specify a flag property """
  name = ndb.StringProperty()
  address = ndb.KeyProperty( Address )
  dogs = ndb.KeyProperty( Dog, repeated = True )
  does_sit = ndb.StringProperty( choices = SIT_PROVIDER_STATUS.values() )

class Note( datastore_entity ):
  """ a note about something, can reference another note as being a reply to it """
  when = ndb.DateTimeProperty()
  what = ndb.StringProperty()
  author = ndb.KeyProperty( Human )
  """
    We take the urlsafe string version of the Note, if any, 
    which this note is a reply to
    This avoids a cyclic dependency 
    Note -> Note
    It also is in this case unnecessary to make an entity group 
    since a Note can not reply to more than one Note. 
  """
  replies_to_note_urlsafe_key = ndb.TextProperty()
  flagged = ndb.StringProperty( choices = FLAG_CHOICES.values(), default = FLAG_CHOICES[ 'UNFLAGGED' ] )

class HoistedSittingStoryGroup( datastore_entity ):
  """ Again the purpose of this is the same to avoid the cyclic dependency 
  Sitting -> SittingStory -> Sitting
  """
  pass

class Sitting( datastore_entity, photographable ):
  """ like a hyper edge between sitters dogs and humans at the sitting """
  sitters = ndb.KeyProperty( Human, repeated = True )
  dogs = ndb.KeyProperty( Dog, repeated = True )
  humans = ndb.KeyProperty( Human, repeated = True )
  when = ndb.DateProperty()
  recurring = ndb.StringProperty( choices = RECURRING_SITTING_STATUS.values() )
  where = ndb.StructuredProperty( Address ) 
  notes = ndb.KeyProperty( Note, repeated = True )
  history = ndb.KeyProperty( HoistedSittingStoryGroup )

class SittingStory( datastore_entity ):
  """ a record of a sitting having occurred """
  sitting = ndb.KeyProperty( Sitting )
  """
    POSSIBLE TODO : dogs, sitters and humans involved could all have individual ratings
    currently the ratings for each group are represented by a single one
    leading to the potentially disatisfying scenario of "Henry the Terrier really had a great time, but Bernard the Poodle seemed border. How to rate?"
  """
  sitters_rate_this = ndb.StringProperty( choices = SITTER_RATES_DOGS_AND_HUMANS.values() )
  humans_rate_this = ndb.StringProperty( choices = HUMANS_RATE_SITTERS.values() )
  dogs_rate_this = ndb.StringProperty( choices = DOGS_RATE_SITTING.values() )
  transaction_status = ndb.StringProperty( choices = TRANSACTION_STATES.values() )
  notes = ndb.KeyProperty( Note, repeated = True )

class X( api ):
  def get( self, code = None ):
    self.response.write( "Hello there %s" % code )

ROUTES = [
  path( r'/human/<code>', handler = X),
  path( r'/note/<code>', handler = X),
  path( r'/dog/<code>', handler = X),
  path( r'/sitting/<code>', handler = X),
  path( r'/sitting-story/<code>', handler = X),
  path( '/<:.*>', handler = X )
]

app = server( ROUTES, debug = True )

def main():
  app.run()

if __name__ == "__main__":
  main()
