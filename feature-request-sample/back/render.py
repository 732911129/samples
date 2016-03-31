from parser import ImprintingParser

from boilerplating_transformer import BoilerplatingTransformer
from indexing_transformer import IndexingTransformer
from projecting_transformer import ProjectingTransformer

b = BoilerPlatingTransformer()
i = IndexingTransformer()
p = ProjectingTransformer()

def imprint( media, control ):
  input = {
      'doc' : control
    }
  boilerplated = b.transform( input )
  indexed = i.transform( boilerplated )
  indexed_mediated = {
      'doc' : indexed[ 'doc' ],
      'index' : indexed[ 'index' ],
      'media' : media
    }
  projected = p.transform( indexed_mediated )
  return projected[ 'doc' ] 
  
  
