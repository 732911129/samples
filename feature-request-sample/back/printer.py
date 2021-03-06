import cgi

from simple_expression_parser import (
    ExpressionParser 
  )

class FragmentPrinter( object ):
  SELF_CLOSING_TAGS = {
      'p-value' : True,
      'img' : True,
      'link' : True,
      'meta' : True,
      'input' : True,
      'area' : True,
      'base' : True,
      'br' : True,
      'col' : True,
      'hr' : True,
      'keygen' : True,
      'param' : True,
      'source' : True,
      'track' : True,
      'wbr' : True,
      'embed' : True
    }
  MAX_EXTRA_INDENT = 10
  INDENT_SEQUENCE = "  "
  indenting_on = True
  doc = ""
  depth = 0
  leaf = True

  def start_new_output( self, indenting_on = True ):
    self.doc = ""
    self.depth = 0
    self.leaf = True
    self.indenting_on = indenting_on

  def end_output( self ):
    pass

  def get_output( self ):
    return self.doc

  def print_safe_raw( self, raw = '' ):
    if type( raw ) is str or type( raw ) is unicode:
      self.print_new_indented_line()
      self.doc += raw.strip()
    elif type( raw ) is list:
      for raw_item in raw:
        self.print_safe_raw( raw_item )

  def print_new_indented_line( self ):
    if self.indenting_on:
      self.print_newline()
      self.print_indent()

  def escape_attribute_value( self, val ):
    return cgi.escape( val )

  def escape_tag_data( self, data ):
    return cgi.escape( data )

  def print_data( self, data ):
    self.doc += self.escape_tag_data( data )

  def print_doctype( self ):
    self.doc += '<!DOCTYPE html>'

  def print_newline( self ):
    self.doc += "\n"

  def print_indent( self, extra = 0 ):
    try:
      extra = int( extra )
      extra = min( self.MAX_EXTRA_INDENT, extra )
    except:
      raise TypeError( 'Extra indent value is not an integer less than %s' % self.MAX_EXTRA_INDENT )
    self.doc += self.INDENT_SEQUENCE * ( self.depth + extra ) 

  def print_space( self ):
    self.doc += " "

  def print_quote( self ):
    self.doc += "\""

  def print_attr( self, attr ):
    self.print_space()
    self.doc += attr[ 0 ] 
    try:
      value = attr[ 1 ]
      if value is not None:
        self.doc += "="
        self.print_quote()
        self.doc += self.escape_attribute_value( value )
        self.print_quote()
    except IndexError:
      pass

  def print_start_tag_opener( self, tag ):
    self.doc += '<' + tag

  def print_start_tag_closer( self ):
    self.doc += '>'

  def print_self_closing_tag_closer( self ):
    self.print_space()
    self.doc += '/>'
    self.leaf = False

  def print_tag( self, tag, attrs = [] ):
    self.leaf = True
    self.print_new_indented_line()
    self.print_start_tag_opener( tag )
    if attrs:
      for attr in attrs:
        self.print_attr( attr )
    if tag in self.SELF_CLOSING_TAGS:
      self.print_self_closing_tag_closer()
    else:
      self.print_start_tag_closer()
      self.depth += 1

  def print_end_tag( self, tag ):
    self.depth -= 1
    if not self.leaf:
      self.print_new_indented_line()
    self.doc += '</' + tag + '>'
    self.leaf = False

if __name__ == "__main__":
  p = FragmentPrinter()
  p.start_new_output( 'doc 1' )
  p.print_tag( 'form', [ ( 'method', 'GET' ), ( 'action', '/' ) ] )
  p.print_tag( 'input', [ ( 'type', 'submit' ) ] )
  p.print_end_tag( 'form' )
  p.end_output()
  print p.get_output()
