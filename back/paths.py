import sys


class paths( object ):
  root = "front"

  def __getattr__( self, name ):
    return self[ name ]

  def __getitem__( self, name ):
    return self.root + "/" + name

sys.modules[ __name__ ] = paths()
