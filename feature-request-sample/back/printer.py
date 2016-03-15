from boilerplate import boilerplate

class Printer( object ):
  self.doc = ""
  self.depth = 0

  def print_attr( self, attr ):
    pass

  def get_document():
    return self.doc

  def open_document( self, attr ):
    self.doc += '<!DOCTYPE html>'
    self.doc += '<html>'
    self.open_tag( 'head' )

  def close_document( self, attr ):
    self.doc += '</html>'
