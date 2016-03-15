import os

def read( rootpath ):
  rootoffset = "../"
  current = os.path.dirname( __file__ )
  root = os.path.join( current, rootoffset )
  path = os.path.join( root, rootpath )
  print path
  with open( path, "r" ) as fin:
    contents = fin.read()
  return contents



