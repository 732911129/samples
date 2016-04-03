import logging
from HTMLParser import HTMLParser as html
from binder import Binder
from printer import FragmentPrinter

class Parser( html, object ):
  pass

class ParserBase( Parser ):
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

class ImprintingParser( ParserBase ):
  binder = Binder()
  printer = FragmentPrinter()
  model = None
  next_data = None

  def perform_bind( self, tags ):
    for tag_bound_data in tags:
      tag, attrs, data, close_tag = None, None, None, None
      tag, attrs, data, close_tag = tag_bound_data
      if tag and not close_tag:
        self.printer.print_tag( tag, attrs )
      if data or self.next_data:
        self.handle_data( data or '' )
      if close_tag:
        self.handle_endtag( tag )

  def prepare_bind( self, tag, attrs ):
    tags = []
    try:
      bound_data = self.binder.try_bind( self, tag, attrs, self.model )
    except BaseException as e:
      raise TypeError( e )
    else:
      if type( bound_data ) is tuple:
        tags = [ bound_data ]
      elif type( bound_data ) is list:
        tags = bound_data
      elif bound_data is None:
        tags = [ ( tag, attrs, None, None ) ]

    return tags

  def handle_starttag( self, tag, attrs ):
    tags = self.prepare_bind( tag, attrs )
    self.perform_bind( tags )

  def handle_startendtag( self, tag, attrs ):
    self.handle_starttag( tag, attrs )

  def handle_data( self, data ):
    if self.next_data:
      self.printer.print_data( self.next_data )
      self.next_data = None
    self.printer.print_data( data )

  def handle_endtag( self, tag ):
    self.printer.print_end_tag( tag )

  def reset( self ):
    super( ImprintingParser, self ).reset()
    self.binder = Binder()
    self.printer = FragmentPrinter()
    self.next_data = None
    self.model = None

  def close( self ):
    super( ImprintingParser, self ).close()
    self.printer.end_output()

  def get_output( self ):
    return self.printer.get_output()

  def imprint( self, view, model ):
    self.reset()
    self.model = model
    self.printer.start_new_output()
    self.feed( view )
    self.close()
    result = self.get_output()
    self.reset()
    return result
