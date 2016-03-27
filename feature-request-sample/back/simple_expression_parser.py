import re
from specialty_utils import superclass

class RuleParser( object ):
  """
    Shares a parsing interface with HTMLParser
    Parses rules like:
        id is a and class includes b or
        class includes c or
        href startswith https or
        src endswith .jpg
  """
  AND_TOKEN = re.compile( r'\s+and\s' )
  OR_TOKEN = re.compile( r'\s+or\s' )
  COMMA_TOKEN = re.compile( r'\s*,\s*' )
  SPACE_TOKEN = re.compile( r'\s+' )
  root_OR_expression = dict()

  def get_output( self ):
    return self.root_OR_expression

  def imprint( self, text ):
    self.reset()
    self.feed( text )
    result = self.get_output()
    self.reset()
    return result

  def new_operand_expression( self, raw ):
    raw = raw.strip()
    expression = self.SPACE_TOKEN.split( raw, maxsplit = 2 )
    name, operand, values = expression
    return {
        'operand' : operand,
        'name' : name,
        'values' : values
      }

  def new_and_expression( self, expressions ):
    return {
        'operand' : 'AND',
        'parameters' : expressions
      }

  def new_or_expression( self, expressions ):
    return {
        'operand' : 'OR',
        'parameters' : expressions
      }

  def feed( self, text ):
    text = text.strip()
    and_expressions = self.OR_TOKEN.split( text )
    and_expressions = map( lambda and_expression : self.AND_TOKEN.split( and_expression ), and_expressions )
    and_expressions = [ map( lambda exprs : self.new_operand_expression( exprs ), operand_expressions ) for operand_expressions in and_expressions ]
    and_expressions = map( lambda exprs : self.new_and_expression( exprs ), and_expressions )
    or_expression = self.new_or_expression( and_expressions )
    self.root_OR_expression = or_expression

  def reset( self ):
     self.root_OR_expression = dict()

class ElementMatchingIndexer( RuleParser ):
  index = dict()

  def build_index( self, tree ):
    return tree
            
  def imprint( self, text ):
    tree = superclass( self ).imprint( self, text )
    self.index = self.build_index( tree )
    result = self.index
    self.reset()
    return result

  def reset( self ):
    superclass( self ).reset( self )
    self.index = dict()

class DataPrintingRuleParser( RuleParser ):
  pass

if __name__ == "__main__":
  x = RuleParser()
  print x.imprint( 
      """
        id is a and class includes b or
        class includes c or
        href startswith https or
        src endswith .jpg
      """ 
    )
  print x.imprint(
      """
        porcupine on-attr live-source and
        porcupine print-children all-descendents and
        porcupine set-attr message "hello world" and
        porcupine print-attr href and 
        porcupine set-attr title porcupine
      """
    )
