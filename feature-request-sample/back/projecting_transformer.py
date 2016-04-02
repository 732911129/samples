import re
from parser import ParserBase, ImprintingParser
from printer import FragmentPrinter
from simple_expression_parser import ExpressionParser
from transformer import Transformer

class IndexMatcher( object ):
  LIST_SEPARATORS = re.compile( r'[\s,]+' )

  def map_by_name( self, tuples ):
    map = dict()
    for tuple in tuples:
      map[ tuple[ 0 ] ] = tuple[ 1 ] 
    return set( map.keys() ), map

  def matches( self, expression, test_value = u'' ):
    op = expression.get( 'operand' ).lower()
    value = unicode( expression.get( 'values' ) )

    if op == 'is':
      return value == test_value
    elif op == 'startswith':
      return test_value.startswith( value )
    elif op == 'endswith':
      return test_value.endswith( value )
    elif op == 'includes':
      return value in self.LIST_SEPARATORS.split( test_value )
    elif op == 'contains':
      return value in test_value
    elif op == 'greaterthan':
      return test_value > value
    elif op == 'lessthan':
      return test_value < value
    elif op == 'isnot':
      return value != test_value
    else:
      raise TypeError( 'Op %s is an unknown operand.' % ( op, ) )

  def match( self, name_value_pairs, index = dict() ):
    """
      The format of index is a map of names to expressions.
      And expression has a name ( the name it is indexed by )
      ( actually it is a map of names to lists of expressions )
      ( FIXME : correctly use lists of expressions )
      Expression has operand, value and also either 'AND' or 'result'
      'AND' indicates there are more expressions that can be matched.
      'result' is a list of results that are valid if we match this expression.
      If we don't match an expression, then there is no need to see if we match
      any of the results from expressions that descend from the expression's AND slot.
      If we do match an expression ( our value and the expression return True from the matches method ) then we add the index that is the value of the expressions AND slot to the frontier queue. We keep processing this ( matching expressions ) until the frontier queue is exhausted, and we store all the results that match. 
    """

    frontier_queue = list()
    matching_results = list()

    frontier_queue.append( index )

    names, map = self.map_by_name( name_value_pairs )

    while len( frontier_queue ):
      frontier = frontier_queue.pop( 0 )
      overlap = names & set( frontier.keys() )
      for key in overlap:
        expressions, value = index[ key ], map[ key ]
        for expression in expressions:
          if not self.matches( expression, value ):
            continue
          if expression.get( 'AND' ):
            frontier_queue.append( expression.get( 'AND' ) )
          if expression.get( 'RESULT' ):
            matching_results.append( expression.get( 'RESULT' ) )

    return matching_results

class ProjectionPointParser( ParserBase ):
  """
    Attribute and data p-value parser.
    Returns printed value of the attribute or data.
    Parses attributes or HTML data that contains p-value tags, and replaces those tags with their values
  """
  VALUE_TAG = 'p-value'
  NAME_ATTR = 'name'
  DEFAULT_ATTR = 'default'
  printer = FragmentPrinter()
  projections = dict()
  print_defaults = False

  def handle_starttag( self, tag, attrs ):
    if tag != self.VALUE_TAG:
      self.printer.print_tag( tag, attrs )
    else:
      if self.print_defaults:
        projected_value = self.get_attribute_value( self.DEFAULT_ATTR, attrs )
        self.printer.print_data( projected_value )
      else:
        name = self.get_attribute_value( self.NAME_ATTR, attrs )
        try:
          projected_value = self.projections[ name ]
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
    super( ProjectionPointParser, self ).reset()
    self.printer = FragmentPrinter()
    self.requests = dict()
    self.print_defaults = False
    self.printer.start_new_output()

  def get_output( self ):
    return self.printer.get_output()

  def imprint( self, raw, projections, doc_printer, tag, attrs, print_defaults ):
    self.reset()
    self.projections = projections
    self.print_defaults = print_defaults
    self.feed( raw )
    self.close()
    result = self.printer.get_output()
    self.reset()
    return result

class PrintParser( object ):
  """
    Understands things like:
      porcupine on-attr live-source and
      porcupine print-children all-descendents and
      porcupine set-attr message "hello world" and
      porcupine print-attr href and 
      porcupine set-attr title porcupine
  """
  EQUALS = re.compile( "\s*=\s*" )
  projection_parser = ProjectionPointParser()
  expression_parser = ExpressionParser()
  scopes = dict()
  print_attr_activated = False

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

  def set_attr( self, name, value, attrs ):
    """
      Since we can have multiple attributes with the same name, 
      and multiple values, and since set sets the value of an attribute,
      it works to remove any attributes of that name first
      and then set the attribute.
    """
    attrs = self.attr_off( name, attrs )
    attrs.append( ( name, value ) )
    return attrs

  def print_attr( self, printed_attr, value_map, doc_printer, tag, attrs, print_defaults = False ):
    """
      For this one, we step through each attribute
      and when the attribute's name matches attr
      we apply the attribute parser to that attribute's value 
      using the value_map
    """
    new_attrs = []
    for attr in attrs:
      if attr[ 0 ] == printed_attr:
        new_attrs.append( ( attr[ 0 ], self.projection_parser.imprint( attr[ 1 ], value_map, doc_printer, tag, attrs, print_defaults ) ) )
    for attr in new_attrs:
      self.attr_off( attr[ 0 ], attrs )
      attrs.append( attr )
    return attrs

  def project( self, projection, parser, tag, attrs, media ):
    op = projection.get( 'operand' )
    values = projection.get( 'values' )
    name = projection.get( 'name' )
    if op == 'set-attr':
      if values.endswith( "'" ):
        attr, value = self.EQUALS.split( values )
        value = value[ 1 : -1 ]
      elif media.hasslot( name ):
        attr, value = values, media.getslot( name )
      else:
        raise TypeError( "No such set-attr implementation" )
      self.set_attr( attr, value, attrs )
    elif op == 'print-attr':
      if not media.hasslot( name ):
        raise TypeError( 'Print attr requests a slot that media does not have' )
      try:
        scope = self.scopes[ values ]
      except KeyError:
        scope = self.scopes[ values ] = dict()
      finally:
        scope[ name ] = media.getslot( name )
        self.print_attr_activated = True
    else:
      raise TypeError( "Not implemented" )

  def reset( self ):
    self.projection_parser = ProjectionPointParser()
    self.expression_parser = ExpressionParser()
    self.reset_print_attr_scopes()

  def reset_print_attr_scopes( self ):
    self.scopes = dict()
    self.print_attr_activated = False

class ProjectingParser( ImprintingParser ):
  REMOVE_SYMBOLS = True
  expression_parser = ExpressionParser()
  projector = PrintParser()
  matcher = IndexMatcher() 
  media = dict()
  index = dict()

  def get_projections( self, attrs ):
    raw_projections = self.get_attribute_value( 'projects-from', attrs )
    parsed_projections = self.expression_parser.imprint( raw_projections )
    """
      expression parser returns an OR node which has AND nodes as children
      the format of the projects-from attribute is a single AND node
      with the projections being its parameters
      hence it is accessed via the key path:
      parameters, 0, paramaters
      as below
    """
    projections = parsed_projections[ 'parameters' ][ 0 ][ 'parameters' ]
    return projections

  def handle_starttag( self, tag, attrs ):
    media = self.media
    projected = self.has_attribute( 'projects-from', attrs )
    projector = self.has_attribute( 'projects-to', attrs )
    if media:
      matches = self.matcher.match( attrs, self.index )
      if projected and matches and media:
        projections = self.get_projections( attrs ) 
        for projection in projections:
          self.projector.project( projection, self, tag, attrs, media )
      elif projected:
        raise TypeError( "Projects-from and has no matching projects-to source" )
      elif matches:
        raise TypeError( "Projects-to and does not use the projections." )
    if self.REMOVE_SYMBOLS:
      if not media:
        for attr in attrs:
          self.projector.print_attr( attr[ 0 ], None, self.printer, tag, attrs, print_defaults = True )
      if projected:
        self.projector.attr_off( 'projects-from', attrs )
      if projector:
        self.projector.attr_off( 'projects-to', attrs )

    if self.projector.print_attr_activated:
      for attr, scope in self.projector.scopes.iteritems():
        self.projector.print_attr( attr, scope, self.printer, tag, attrs )
      self.projector.reset_print_attr _scopes()

    super( ProjectingParser, self ).handle_starttag( tag, attrs )

  def imprint( self, doc, index, media ):
    self.reset()
    self.index = index
    self.media = media
    self.feed( doc )
    result = self.get_output()
    self.reset()
    return result

  def reset( self ):
    super( ProjectingParser, self ).reset()
    self.index = dict()
    self.media = dict()
    self.matcher = IndexMatcher()
    self.expression_parser = ExpressionParser()
    self.projector = PrintParser()

class ProjectingTransformer( Transformer ):
  def transform( self, input ):
    doc = input[ 'doc' ]
    index = input[ 'index' ]
    media = input[ 'media' ]
    p = ProjectingParser()
    projected_doc = p.imprint( doc, index, media )
    output = {
        'doc' : projected_doc
      }
    return output

