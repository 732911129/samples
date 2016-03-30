import re

from specialty_utils import (
    superclass
  )

from simple_expression_parser import (
    ExpressionParser
  )

LIST_SEPARATORS = re.compile( r'[\s,]+' )

class IndexMatcher( object ):
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
      return value in LIST_SEPARATORS.split( test_value )
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

class IndexBuilder( object ):
  parser = ExpressionParser()
  index = dict()

  def add_index( self, tree, result ):
    """ 
      TODO: test
      Step through all AND_expressions and add each index each one.
    """
    OR_parameters = tree[ 'parameters' ]
    for AND_node in OR_parameters:
      self.index_AND_expression_result( self.index, AND_node, result )
    return self.index

  def index_AND_expression_result( self, existing_tree, AND_node, result ):
    """
      TODO: make more efficient by combining the index list further
      Add one AND_node ( including all its descendent expressions ) to the 
      index tree where it maps to result
    """
    root_tree = existing_tree
    expressions = AND_node[ 'parameters' ]
    for expression in expressions:
      name = expression[ 'name' ]
      try:
        index = existing_tree[ name ]
      except KeyError:
        index = existing_tree[ name ] = [ expression ]
      else:
        index.append( expression )
      if expression is expressions[ -1 ]:
        expression[ 'RESULT' ] = result
      else:
        expression[ 'AND' ] = existing_tree = {}
    return root_tree
            
  def feed_text_and_slot_name( self, text, slot_name ):
    tree = parser.imprint( text )
    self.index = self.add_index( tree, slot_name )
    return self.index

  def imprint( self, slot_name_text_pairs, existing_index = None ):
    self.reset()
    if existing_index:
      self.index = existing_index
    for slot_name, text in slot_name_text_pairs:
      tree = self.parser.imprint( text )
      self.add_index( tree, slot_name )
    result = self.index
    self.reset()
    return result

  def reset( self ):
    self.index = dict()
    self.parser = ExpressionParser()

if __name__ == "__main__":
  import pprint
  x = IndexBuilder()
  y = x.imprint( 
      [
          (
              "name1",
              """
                id is a and class includes b or
                class includes c or
                href startswith https or
                src endswith .jpg
              """ 
            ),
          (
              "name2",
              """
                id is xy and class includes D or
                href endswith jpeg 
              """ 
            ) 
        ] 
    )
  z = IndexMatcher()
  attrs = [
    ( 'id', 'a' ),
    ( 'class', 'x y b z' ),
    ( 'href', 'https://asdasdsa.jpeg' )
  ]
  r = z.match( attrs, y )
  pp = pprint.PrettyPrinter( indent=2 )
  pp.pprint( y )
  pp.pprint( attrs )
  pp.pprint( r )

