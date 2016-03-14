class views( object ):
  __cache = dict()

  def __init__( self ):
    self._view404 = """
      <html>
        <head>
          <title>404 Error Not Found</title>
        </head>
        <body>
          <h1>404 Error Not Found</h1>
        </body>
      </html>
    """

  def __getattr__( self, name ):
    return self[ name ]

  def __getitem__( self, name ):
    from .back import paths
    from .back import files
    name = unicode( name )
    view_path = paths[ name ] + ".html"
    view_content = None
    try:
      view_content = self.__cache[ view_path ]
    except KeyError:
      try:
        view_content = self.__cache[ view_path ] = files.read( view_path )
      except:
        if self.__dict__.get( '_' + name ):
          view_content = self.__dict__[ '_' + name ]
        else:
          view_content = None
    finally:
      return view_content
      
def install():
  import sys
  sys.modules[ __name__ ] = views()

install()

