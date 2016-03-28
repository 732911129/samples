from simple_expression_parser import (
    ExpressionParser 
  )

from parser import (
    ProjectionPointParser
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

