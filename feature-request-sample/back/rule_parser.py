import re

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
  SPACE_TOKEN = re.compile( r'\s+' )
  rules = dict()

  def reset( self ):
    self.rules = dict()

  def new_rule( self, raw ):
    raw = raw.strip()
    expression = self.SPACE_TOKEN.split( raw )
    attr, rule, value = expression
    return {
        'rule' : rule,
        'attr' : attr,
        'value' : value
      }

  def feed( self, text ):
    and_rules = self.OR_TOKEN.split( text )
    or_rules = map( lambda and_rule : self.AND_TOKEN.split( and_rule ), and_rules )
    for and_rules in or_rules:
      for and_rule in and_rules:  
        rule = self.new_rule( and_rule )
        try:
          rule_list = self.rules[ rule[ 'attr' ] ]
        except KeyError:
          rule_list = self.rules[ rule[ 'attr' ] ] = list()
        finally:
          rule_list.append( rule )

  def get_output( self ):
    return self.rules

  def imprint( self, text ):
    self.reset()
    self.feed( text )
    result = self.get_output()
    self.reset()
    return result

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
