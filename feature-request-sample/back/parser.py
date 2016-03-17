from HTMLParser import HTMLParser as html
import logging
from binder import Binder
from printer import Printer
from specialty_utils import superclass

class ImprintingParser( html ):
  MULTIPLE_ATTRIBUTE_VALUE_SEPARATOR = " "
  binder = Binder()
  printer = Printer()
  model = None
  next_data = None

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

  def perform_bind( self, tags ):
    for tag_bound_data in tags:
      tag, attrs, data, close_tag = None, None, None, None
      tag, attrs, data, close_tag = tag_bound_data
      if tag:
        self.printer.print_tag( tag, attrs )
      if data:
        self.printer.print_data( data )
      if close_tag:
        self.printer.print_end_tag( tag )

  def handle_starttag( self, tag, attrs ):
    tags = []
    bound_data = None
    try:
      bound_data = self.binder.try_bind( self, tag, attrs, self.model )
    except BaseException as e:
      logging.warn( e ) 

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
