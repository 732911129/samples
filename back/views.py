class views( object ):
  __cache = dict()

  def __getattr__( self, name ):
    return self[ name ]

  def __getitem__( self, name ):
    from .back import paths
    from .back import files
    view_path = paths[ name ] + ".html"
    view_content = None
    try:
      view_content = self.__cache[ view_path ]
    except KeyError:
      try:
        view_content = self.__cache[ view_path ] = files.read( view_path )
      except:
        view_content = self.view404
    finally:
      return view_content
      
def install():
  import sys
  sys.modules[ __name__ ] = views()

install()

