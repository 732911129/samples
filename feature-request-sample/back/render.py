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

def get_value_or_data_bind_name( attr ):
  return attr[ 1 ]

def is_value_or_data_binder( attr, model ):
  if type( model ) is Collection:
    return False
  if attr[ 0 ] == 'name':
    result = model.hasslot( get_value_or_data_bind_name( attr ) )
    return result
  return False

class ImprintingParser( html ):
  depth = 0
  output = ""
  model = None
  next_data = None
  next_select_value = None

  def bind_value_or_data( self, tag, attr, model ):
    name = get_value_or_data_bind_name( attr )
    value = model.getslot( name )
    if tag == 'input':
      self.output += " " + 'value="' + unicode( value ) + '"'
    elif tag == 'textarea':
      self.next_data = unicode( value )
    elif tag == 'select':
      self.next_select_value = unicode( value )
    else:
      print attr, model
      raise TypeError( 'Bound data on %s which is not input or textarea' % tag )

  def bind_attr_if_binder( self, tag, attr ):
    if is_value_or_data_binder( attr, self.model ):
      self.bind_value_or_data( tag, attr, self.model )
    if (
          tag == 'option' and
          attr[ 0 ] == 'value' and
          self.next_select_value and
          attr[ 1 ] == self.next_select_value
          ):
      self.output += " selected"
      self.next_select_value = None

    if (
          tag == 'form' and
          attr[ 0 ] == 'action'
        ):
      self.output += " " + attr[ 0 ]
      key_id = unicode( self.model.key_id )
      attr_value = instance_id_regex.sub( key_id, attr[ 1 ] )
      self.output += "=" + "\"" + attr_value + "\""
    elif (
          tag == 'ul' and
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
              src=/api/model/type/%(media_type)s/id/%(key_id)s>
          </iframe>
        </li>""" % data
    else:
      self.output += " " + attr[ 0 ]
      if attr[ 1 ]:
        self.output += "=" + "\"" + attr[ 1 ] + "\""

  def handle_starttag( self, tag, attrs ):
    self.depth += 1
    #self.output += "\n"
    #self.output += self.depth * "  "
    self.output += "<" + tag
    for attr in attrs:
      self.bind_attr_if_binder( tag, attr )
        
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