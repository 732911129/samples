from parser import (
    ParserBase,
    ImprintingParser
  )

from printer import (
    Printer
  )

from print_parser import (
    PrintParser,
    ProjectionPointParser
  )

from index import (
    IndexBuilder,
    IndexMatcher
  )

"""
  We do the following steps:
    1. First build the index for the document.
      IndexBuildingParser
    2. Then match each tag against any projection requests.
      IndexMatchingParser
    3. For each that matches perform the requests projections.
      ProjectionImprintingParser
    4. Return the imprinted document text.
"""

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
