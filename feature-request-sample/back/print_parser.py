from parser import (
    ParserBase
  )

from simple_expression_parser import (
    ExpressionParser 
  )


class PrintParser( object ):
  """
    Understands things like:
      porcupine on-attr live-source and
      porcupine print-children all-descendents and
      porcupine set-attr message "hello world" and
      porcupine print-attr href and 
      porcupine set-attr title porcupine
  """
  projection_parser = ProjectionPointParser()
  expression_parser = ExpressionParser()

  def attr_on( self, new_attr, attrs ):
    if not self.projection_parser.has_attribute( new_attr, attrs ) :
      attrs.append( ( new_attr, '' ) )
    return attrs

  def attr_off( self, old_attr, attrs ):
    if self.projection_parser.has_attribute( old_attr, attrs ):
      remove = []
      for index, attr in enumerate( attrs ):
        if attr[ 0 ] == old_attr:
          remove.append( index )
      for offset, index in enumerate( remove ):
        del attrs[ index - offset ]
    return attrs

  def set_attr( self, attr, value, attrs ):
    """
      Since we can have multiple attributes with the same name, 
      and multiple values, and since set sets the value of an attribute,
      it works to remove any attributes of that name first
      and then set the attribute.
    """
    attrs = self.attr_off( attr, attrs )
    attrs.append( ( attr, value ) )
    return attrs

  def print_attr( self, printed_attr, value_map, attrs ):
    """
      For this one, we step through each attribute
      and when the attribute's name matches attr
      we apply the attribute parser to that attribute's value 
      using the value_map
    """
    for attr in attrs:
      if attr[ 0 ] == printed_attr:
        attr[ 1 ] = self.projection_point.imprint( attr[ 1 ], value_map )
    return attrs

  def reset( self ):
    self.projection_parser = ProjectionPointParser()
    self.expression_parser = ExpressionParser()

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

