from google.appengine.ext import ndb
from google.appengine.api import search
import webapp2

from webapp2 import (
  
    WSGIApplication as server,

    Route as path,

    RequestHandler as api

  )

from google.appengine.ext.ndb import (

    get_multi as keys_to_entities,

    Model as datastore_entity,

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

FLAG_CHOICES = {
    'HIDE-AND-REVIEW' : 'HIDE-AND-REVIEW',
    'REVIEWED-VIOLATES-NOTIFIED' : 'REVIEWED-VIOLATED-NOTIFIED',
    'UNFLAGGED' : 'UNFLAGGED'
  }

SIT_PROVIDER_STATUS = {
    'DOES-NOT-AND-DOES-NOT-WANT-TO' : 'DOES-NOT-AND-DOES-NOT-WANT-TO',
    'DOES-NOT-AND-MIGHT-WANT-TO' : 'DOES-NOT-AND-MIGHT-WANT-TO',
    'DOES-NOT-AND-WANTS-TO' : 'DOES-NOT-AND-WANTS-TO',
    'DOES-SIT' : 'DOES-SIT'
  }

RECURRING_SITTING_STATUS = {
    'ONE-OFF-ONLY' : 'ONE-OFF-ONLY',
    'RECURRING-FOR-RIGHT-SITTER' : 'RECURRING-FOR-RIGHT-SITTER',
    'RECURRING-AND-CURRENTLY-PAUSED' : 'RECURRING-AND-CURRENTLY-PAUSED',
    'RECURRING' : 'RECURRING' 
  }

SITTER_RATES_DOGS_AND_HUMANS = {
    'EVERYTHING-GREAT' : 'EVERYTHING-GREAT',
    'SOME-PROBLEMS' : 'SOME-PROBLEMS',
    'TERRIBLE' : 'TERRIBLE',
    'PAYMENT-PROBLEMS' : 'PAYMENT-PROBLEMS'
  }

HUMANS_RATE_SITTERS = {
    'EVERYTHING-GREAT' : 'EVERYTHING-GREAT',
    'SOME-PROBLEMS' : 'SOME-PROBLEMS',
    'TERRIBLE' : 'TERRIBLE',
    'PUNCTUALITY-PROBLEMS' : 'PUNCTUALITY-PROBLEMS',
    'DOGLOSS-PROBLEMS' : 'DOGLOSS-PROBLEMS'
  }

DOGS_RATE_SITTING = {
    'SO-SATISFIED' : 'SO-SATISFIED',
    'NOT-ENOUGH-FOOD' : 'NOT-ENOUGH-FOOD',
    'BORING' : 'BORING',
    'SCARY' : 'SCARY'
  }

""" Some classes are required by others that follow,
and so are placed preceding those which depend on them """

""" This includes the following
Interfaces / Prototypes that can be implemented by models to extend 
functionality and expressiveness in consistent ways """

class HoistedNote( datastore_entity ):
  """ the purpose of this class is to hoist the definition of note
  which otherwise introduces a cyclic dependency,
  Note -> Human -> photographable -> flaggable -> Note
  If we make flaggable -> HoistedNote
  and Note -> HoistedNote
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

class Human( datastore_entity, reputationMeasurable, photographable ):
  """ a human's entry, can have photos, and therefore we specify a flag property """
  name = ndb.StringProperty()
  address = ndb.KeyProperty( Address )
  dogs = ndb.KeyProperty( Dog, repeated = True )
  does_sit = ndb.StringProperty( choices = SIT_PROVIDER_STATUS.values() )

class Note( datastore_entity ):
  parent = HoistedNote
  """ a note about something, can reference another note as being a reply to it """
  when = ndb.DateTimeProperty()
  what = ndb.StringProperty()
  author = ndb.KeyProperty( Human )
  replies_to = ndb.KeyProperty( Note )
  flagged = ndb.StringProperty( choices = FLAG_CHOICES.values(), default = FLAG_CHOICES[ 'UNFLAGGED' ] )

""" Datastore entities that are first class models in the application concept """

class Dog( datastore_entity, reputationMeasurable, photographable ):
  """ a dog's entry, can have photos, and therefore we specify a flag property """
  name = ndb.StringProperty()
  breed = ndb.StringProperty()
  birthday = ndb.DateProperty()

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


class Sitting( datastore_entity, photographable ):
  """ like a hyper edge between sitters dogs and humans at the sitting """
  sitters = ndb.KeyProperty( Human, repeated = True )
  dogs = ndb.KeyProperty( Dog, repeated = True )
  humans = ndb.KeyProperty( Human, repeated = True )
  when = ndb.DateProperty()
  recurring = ndb.StringProperty( choices = RECURRING_SITTING_STATUS.values() )
  where = ndb.StructuredProperty( Address ) 
  notes = ndb.KeyProperty( Note, repeated = True )
  history = ndb.KeyProperty( SittingStory, repeated = True )

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

app = server( ROUTES, debug = True )

def main():
  app.run()

if __name__ == "__main__":
  main()
