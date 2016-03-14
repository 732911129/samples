import re
import os
import paths
import files
from models import Collection
from HTMLParser import HTMLParser as html

instance_id_regex = re.compile( r"new$" )

self_closing_tags = {
    'input' : True,
    'img' : True,
    'link' : True,
    'meta' : True
  }

def attr_is_binder( attr ):
  return attr[ 0 ] == 'name'

def get_binder_name( attr ):
  if attr_is_binder( attr ):
    return attr[ 1 ]
  raise TypeError( 'Value or Data binding attributes must specify slot name' )

def attr_is_binder_for_model( attr, model ):
  """ Collections of models don't have binders currently """
  if attr_is_binder( attr ):
    result = model.hasslot( get_binder_name( attr ) )
    return result
  return False

class ImprintingParser( html ):
  depth = 0
  output = ""
  model = None
  next_data = None
  next_select_value = None

  def bind_value_or_data( self, tag, attr ):
    name = get_binder_name( attr )
    value = self.model.getslot( name )
    if tag == 'input':
      self.output += " " + 'value="' + unicode( value ) + '"'
    elif tag == 'textarea':
      self.next_data = unicode( value )
    elif tag == 'select':
      self.next_select_value = unicode( value )
    else:
      """ currently we only bind values on input and select, or data on textarea """
      """ or radio, see below """
      print attr, self.model
      raise TypeError( 'Bound data on %s which is not input or textarea' % tag )

  def bind_radio_if_binder( self, tag, attrs ):
    """ radio requires special handling, because we are picking one input tag
    to print the checked attribute on out of a set of input tags if and only if
    that input tag bears a value attribute matching our model """
    is_binder = filter( lambda a : attr_is_binder_for_model( a, self.model ), attrs )
    if is_binder:
      attr = is_binder[ 0 ]
      name = get_binder_name( attr )
      value = self.model.getslot( name )
      if ( 'value', value ) in attrs:
        self.output += " checked "  

  def bind_attr_if_binder( self, tag, attr, attrs ):
    if type( self.model ) is Collection:
      """ bind models from a Collection """
      if (
            ( tag == 'ul' or tag == 'ol' ) and
            attr[ 0 ] == 'name' and
            attr[ 1 ] == 'models' and
            type( self.model ) is Collection
          ):
        models = self.model.models    
        data = { 'media_type' : self.model.media_type + '-summary', 'key_id' : 'new' }
        self.next_data = ""
        for model in models:
          data[ 'key_id' ] = unicode( model.id() )
          self.next_data += """<li>
            <iframe 
                resize-triggers="mouseup"
                name="%(media_type)s %(key_id)s"
                src=/api/media/type/%(media_type)s/id/%(key_id)s>
            </iframe>
          </li>""" % data

    elif attr_is_binder_for_model( attr, self.model ):
      """ bind input value, select selected, or textarea data """
      self.bind_value_or_data( tag, attr )

    """ select an option """
    if (
          tag == 'option' and
          attr[ 0 ] == 'value' and
          self.next_select_value and
          attr[ 1 ] == self.next_select_value
        ):
      self.output += " selected"
      self.next_select_value = None
    
    """ replace the new component of a form action with an instance id """
    if (
          tag == 'form' and
          attr[ 0 ] == 'action' and 
          type( self.model ) is not Collection
        ):
      key_id = unicode( self.model.key_id )
      attr_value = instance_id_regex.sub( key_id, attr[ 1 ] )
      attr = ( attr[ 0 ], attr_value )

    """ print the attribute """
    self.print_attr( attr )

  def print_attr( self, attr ):
    self.output += " " + attr[ 0 ]
    if attr[ 1 ]:
      self.output += "=" + "\"" + attr[ 1 ] + "\""

  def handle_starttag( self, tag, attrs ):
    self.depth += 1
    #self.output += "\n"
    #self.output += self.depth * "  "
    self.output += "<" + tag
    if ( 'type', 'radio' ) in attrs:
      """ bind a radio button """
      self.bind_radio_if_binder( tag, attrs )
      for attr in attrs:
        self.print_attr( attr )
    else:
      if type( self.model ) is not Collection:
        """ this does not apply to Collections because the
        view only has name=models """
        binder_exists = filter( lambda a : attr_is_binder_for_model( a, self.model ), attrs )
        """ if we are going to bind a value
        let's remove any other value attributes
        so that our value is not over written by any such defaults 
        FIXME: this will remove value attributes if we are binding data 
        """
        if binder_exists:
          value_attr_indexes = [i for i,a in enumerate(attrs) if a[ 0 ] == 'value' ]
          while value_attr_indexes:
            del attrs[ value_attr_indexes.pop() ]

      # then just print all bind any attributes
      for attr in attrs:
        self.bind_attr_if_binder( tag, attr, attrs )
        
    self.output += ">"
    if self.next_data:
      self.output += self.next_data
      self.next_data = None
    if tag in self_closing_tags:
      self.depth -= 1

  def handle_startendtag( self, tag, attrs ):
    self.handle_starttag( tag, attrs )
    self.depth -= 1

  def handle_data( self, data ):
    self.output += data 

  def handle_endtag( self, tag ):
    #self.output += "\n"
    #self.output += self.depth * "  "
    self.output += "</" + tag + ">"
    self.depth -= 1

  def reset( self ):
    superclass = self.__class__.__bases__[ 0 ]
    superclass.reset( self )
    self.depth = 0
    self.output = ""

  def imprint( self, model, view ):
    self.reset()
    self.model = model
    self.feed( view )
    result = self.output
    self.reset()
    return result

def imprint( model, view ):
  imprinter = ImprintingParser()
  if type( model ) is Collection:
    # TODO : logic for imprinting collection
    return imprinter.imprint( model, view )
  else:
    return imprinter.imprint( model, view )
