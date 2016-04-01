from binder import Binder
from parser import ImprintingParser
from transformer import Transformer
from boilerplate import Boilerplate
from printer import FragmentPrinter

class DocumentPrinter( FragmentPrinter ):
  def start_new_fragment( self, *args, **kwargs ):
    raise TypeError( "Not implemented" )

  def end_fragment( self ):
    raise TypeError( "Not implemented" )

  def get_fragment( self ):
    raise TypeError( "Not implemented" )

  def start_new_document( self, title = 'Untitled', indenting_on = True ):
    self.doc = ""
    self.depth = 0
    self.leaf = True
    self.indenting_on = indenting_on
    self.print_doctype()
    self.print_tag( 'html' )
    self.print_tag( 'head' )
    self.print_boilerplate( 'head/after_begin' )
    self.print_tag( 'title' )
    self.print_data( title )
    self.print_end_tag( 'title' )
    self.print_boilerplate( 'head/before_end' )
    self.print_end_tag( 'head' ) 
    self.print_tag( 'body' )
    self.print_boilerplate( 'body/after_begin' )

  def end_document( self ):
    self.print_boilerplate( 'body/before_end' )
    self.print_end_tag( 'body' )
    self.print_boilerplate( 'body/after_end' )
    self.print_end_tag( 'html' )
   
  def get_document( self ):
    return self.doc

  def print_boilerplate( self, path ):
    parts = path.split( '/' )
    safe_raws = []
    resolved = Boilerplate
    try:
      while len( parts ):
        resolved = resolved[ parts.pop( 0 ) ]
      safe_raws = resolved
    except:
      pass
    for safe_raw in safe_raws:
      self.print_safe_raw( safe_raw )

class BoilerplatingParser( ImprintingParser ):
  printer = DocumentPrinter()

  def reset( self ):
    super( BoilerplatingParser, self ).reset()
    self.binder = Binder()
    self.printer = DocumentPrinter()
    self.next_data = None
    self.model = None
    self.printer.start_new_document()

  def close( self ):
    super( BoilerplatingParser, self ).close() 
    self.printer.end_document()

  def get_output( self ):
    return self.printer.get_document()

  def imprint( self, doc ):
    self.reset()
    self.feed( doc )
    result = self.get_output()
    self.reset()
    return result

class BoilerplatingTransformer( Transformer ):
  def transform( self, input ):
    p = BoilerplatingParser()
    doc = input[ 'doc' ]
    boilerplated_doc = p.imprint( doc )
    output = {
        'doc' : boilerplated_doc
      }
    return output
