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

class IndexMatchingParser( ParserBase ):
  projector = ProjectionPointParser()

  def reset( self ):
    superclass( self ).reset( self )
    self.projector = ProjectionPointParser()

  def handle_starttag( self, tag, attrs ):
    projected = self.has_attribute( 'project-from', attrs )
    if projected:
      projections = self.get_attribute_value( 'project-from', attrs )
      self.projector.imprint( projections, self, tag, attrs )

