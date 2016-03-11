import os
import paths
import files
from HTMLParser import HTMLParser as html

class ImprintingParser( html ):
  depth = 0
  output = ""
  model = None

  def handle_starttag( self, tag, attrs ):
    self.depth += 1
    self.output += self.depth * "\t"
    self.output += "<" + tag
    for attr in attrs:
      self.output += " " + attr[ 0 ]
      if attr[ 1 ]:
        self.output += "=" + "\"" + attr[ 1 ] + "\""
    self.output += ">"

  def handle_startendtag( self, tag, attrs ):
    self.handle_starttag( tag, attrs )
    self.output += "\n"
    self.depth -= 1

  def handle_data( self, data ):
    self.output += data 

  def handle_endtag( self, tag ):
    self.output += self.depth * "\t"
    self.output += "</" + tag + ">"
    self.output += "\n"
    self.depth -= 1

  def reset( self ):
    superclass = self.__class__.__bases__[ 0 ]
    superclass.reset( self )
    self.depth = 0
    self.output = ""

  def imprint( self, model, view ):
    self.reset()
    self.model = model
    self.feed( view )
    result = self.output
    self.reset()
    return result

imprinter = ImprintingParser()

def imprint( model, view ):
  return imprinter.imprint( model, view )
