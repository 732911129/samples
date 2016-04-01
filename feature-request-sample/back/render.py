from parser import ImprintingParser

from boilerplating_transformer import BoilerplatingTransformer
from indexing_transformer import IndexingTransformer
from projecting_transformer import ProjectingTransformer

b = BoilerplatingTransformer()
i = IndexingTransformer()
p = ProjectingTransformer()

def imprint( media_instance, control ):
  input = {
      'doc' : control,
      'media' : media_instance
    }
  boilerplated = b.transform( input )
  indexed = i.transform( boilerplated )
  indexed_mediated = {
      'doc' : indexed[ 'doc' ],
      'index' : indexed[ 'index' ],
      'media' : media_instance
    }
  projected = p.transform( indexed_mediated )
  return projected[ 'doc' ] 
  
  
