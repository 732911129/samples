from parser import (
    ParserBase
  )

from specialty_utils import superclass

class TreeBuilder( ParserBase ):
  """
    Builds a tree from some HTML tags.
  """
  tag_stack = list()
  children = list()
  root = {}

  def new_tag( self, tag, attrs ):
    return {
        'tag' : tag,
        'attrs' : attrs,
        'children' : list()
      }

  def handle_starttag( self, tag, attrs ):
    new_tag = self.new_tag( tag, attrs )
    self.tag_stack.append( new_tag )
    self.children = list()

  def handle_endtag( self, tag ):
    top_tag = self.tag_stack.pop() 
    top_tag[ 'children' ] = self.children
    self.children = self.tag_stack[ -1 ][ 'children' ]
    self.children.append( top_tag )

  def reset( self ):
    superclass( self ).reset( self )
    self.root = self.new_tag( ':root', [] )
    self.tag_stack = [ self.root ]
    self.children = list()

  def get_output( self ):
    return self.root

  def imprint( self, html_string ):
    self.reset()
    self.feed( html_string )
    self.close()
    result = self.get_output()
    self.reset()
    return result
    
