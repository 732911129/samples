import re

from transformer import Transformer

from specialty_utils import (
    superclass
  )

from simple_expression_parser import (
    ExpressionParser
  )

from parser import (
    ParserBase
  )

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

class IndexBuildingParser( ParserBase ):
  PROJECTING_CONTROLS = {
    'input' : True,
    'select' : True,
    'textarea' : True
  }
  slot_name_projection_request_text_pairs = [] 
  index_builder = IndexBuilder()
  index = dict()

  def reset( self ):
    superclass( self ).reset( self )
    self.slot_name_projection_request_text_pairs = [] 
    self.index_builder = IndexBuilder()
    self.index = dict()

  def handle_starttag( self, tag, attrs ):
    if tag in PROJECTING_CONTROLS:
      slot_name = self.get_attribute_value( 'name', attrs )
      projection_requests_text = self.get_attribute_value( 
            'project-to', attrs )
      self.slot_name_projection_request_text_pairs.append(
            ( slot_name, projection_requests_text ) )

  def get_output( self ):
    return self.index

  def feed( self, doc_text ):
    superclass( self ).feed( self, doc_text )
    self.index = self.index_builder.imprint( 
          self.slot_name_projection_request_text_pairs,
          self.index )

  def imprint( self, doc_text, media ):
    self.reset()
    self.feed( doc_text )
    result = self.get_output() 
    self.reset()
    return result

class IndexingTransformer( Transformer ):
  def transform( self, input ):
    i = IndexBuildingParser()
    doc = index[ 'doc' ]
    index = i.imprint( doc )
    output = {
        'doc' : doc,
        'index' : index 
      }
    return output

