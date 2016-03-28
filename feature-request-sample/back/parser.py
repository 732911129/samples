import logging
from HTMLParser import HTMLParser as html
from binder import Binder
from printer import Printer
from specialty_utils import superclass

class ParserBase( html ):
  MULTIPLE_ATTRIBUTE_VALUE_SEPARATOR = " "

  def has_attribute( self, attr_name, attrs ):
    for attr in attrs:
      if attr[ 0 ] == attr_name:
        return True
    return False

  def get_attribute( self, attr_name, attrs ):
    if self.has_attribute( attr_name, attrs ):
      return ( attr_name, self.get_attribute_value( attr_name, attrs ) )
    return None

  def get_attribute_value( self, attr_name, attrs ):
    selected = []
    has_attribute = False
    for attr in attrs:
      if attr[ 0 ] == attr_name:
        has_attribute = True
        try:
          selected.append( attr[ 1 ] )
        except:
           pass
    if has_attribute:
      return self.MULTIPLE_ATTRIBUTE_VALUE_SEPARATOR.join( selected )
    return None

class TreeBuilder( ParserBase ):
  """
    Builds a tree from some HTML tags.
  """
  tag_stack = list()
  children = list()
  root = {}

  def new_tag( self, tag, attrs ):
    return {
        'tag' : tag,
        'attrs' : attrs,
        'children' : list()
      }

  def handle_starttag( self, tag, attrs ):
    new_tag = self.new_tag( tag, attrs )
    self.tag_stack.append( new_tag )
    self.children = list()

  def handle_endtag( self, tag ):
    top_tag = self.tag_stack.pop() 
    top_tag[ 'children' ] = self.children
    self.children = self.tag_stack[ -1 ][ 'children' ]
    self.children.append( top_tag )

  def reset( self ):
    superclass( self ).reset( self )
    self.root = self.new_tag( ':root', [] )
    self.tag_stack = [ self.root ]
    self.children = list()

  def get_output( self ):
    return self.root

  def imprint( self, html_string ):
    self.reset()
    self.feed( html_string )
    self.close()
    result = self.get_output()
    self.reset()
    return result
    
class ProjectionRequestParser( TreeBuilder ):
  """
    input.for attribute parser, takes a string of html and the existing projection table.
    returns the projection table.
    Understands parsing sections of HTML in the for attribute
    of an input element to project that input to different other
    tags. Builds the table used for this projection from the data
    in these attributes

    Understands: p-tag, p-attr, p-data and their attributes.
  """
  projections = dict()

  def reset( self ):
    superclass( self ).reset( self )
    self.projections = dict()

  def extract_projections( self, tree ):
    pass

  def combine_projections( self, p1, p2 ):
    pass

  def get_output( self ):
    new_projections = self.extract_projections( self.root )
    self.projections = self.combine_projections( self.projections, new_projections )
    return self.projections
 
  def imprint( self, for_attr_value, all_projections = None ):
    self.reset()
    self.projections = all_projections or self.projections
    self.feed( for_attr_value )
    self.close()
    result = self.get_output()
    self.reset()
    return result
 
class ProjectionPointParser( ParserBase ):
  """
    Attribute and data p-value parser.
    Returns printed value of the attribute or data.
    Parses attributes or HTML data that contains p-value tags, and replaces those tags with their values
  """
  VALUE_TAG = 'p-value'
  NAME_ATTR = 'name'
  printer = Printer()
  projections = dict()

  def handle_starttag( self, tag, attrs ):
    if tag != VALUE_TAG:
      self.printer.print_tag( tag, attrs )
    else:
      name = self.get_attribute_value( 'name', attrs )
      try:
        projected_value = self.projection[ name ]
      except KeyError:
        logging.warning( '%s requests projection %s but no such entry in projects.' %
                          ( self.VALUE_TAG, name ) )
      else:
        self.printer.print_data( projected_value )

  def handle_startendtag( self, tag, attrs ):
    self.handle_starttag( tag, attrs )

  def handle_data( self, data ):
    self.printer.print_data( data )

  def handle_endtag( self, tag ):
    self.printer.print_end_tag( tag )

  def reset( self ):
    superclass( self ).reset( self )
    self.printer = Printer()
    self.requests = dict()
    self.printer.start_new_fragment()

  def get_output( self ):
    return self.printer.get_fragment()

  def imprint( self, raw, projections ):
    self.reset()
    self.projections = projections
    self.feed( raw )
    self.close()
    result = self.printer.get_fragment()
    self.reset()
    return result

class ImprintingParser( ParserBase ):
  binder = Binder()
  printer = Printer()
  model = None
  next_data = None

  def perform_bind( self, tags ):
    for tag_bound_data in tags:
      tag, attrs, data, close_tag = None, None, None, None
      tag, attrs, data, close_tag = tag_bound_data
      if tag and not close_tag:
        self.printer.print_tag( tag, attrs )
      if data:
        self.printer.print_data( data )
      if close_tag:
        self.printer.print_end_tag( tag )

  def handle_starttag( self, tag, attrs ):
    tags = []
    try:
      bound_data = self.binder.try_bind( self, tag, attrs, self.model )
    except BaseException as e:
      logging.warning( e ) 
    else:
      if type( bound_data ) is tuple:
        tags = [ bound_data ]
      elif type( bound_data ) is list:
        tags = bound_data
      elif bound_data is None:
        tags = [ ( tag, attrs, None, None ) ]

      self.perform_bind( tags )

  def handle_startendtag( self, tag, attrs ):
    self.handle_starttag( tag, attrs )

  def handle_data( self, data ):
    self.printer.print_data( data )

  def handle_endtag( self, tag ):
    self.printer.print_end_tag( tag )

  def reset( self ):
    superclass( self ).reset( self )
    self.binder = Binder()
    self.printer = Printer()
    self.next_data = None
    self.model = None
    self.printer.start_new_document()

  def close( self ):
    superclass( self ).close( self ) 
    self.printer.end_document()

  def get_output( self ):
    return self.printer.get_document()

  def imprint( self, model, view ):
    self.reset()
    self.model = model
    self.feed( view )
    self.close()
    result = self.get_output()
    self.reset()
    return result
