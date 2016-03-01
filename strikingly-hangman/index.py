
def get_words():
  with open( 'words.txt', 'r' ) as words_file:
    words = set( [ x.strip().upper() for x in words_file.readlines() ] )
  return words
 
def produce_keys( word ):
  return zip( range(len(word)), word )

def index_word( word, table ):
  keys = produce_keys( word )
  for key in keys:
    try:
      word_set = table[ key ]
    except KeyError:
      word_set = table[ key ] = set()
    word_set.add( word )

def index_all_words( words ):
  table = dict()
  for word in words:
    index_word( word, table )
  return table

def query( keys, table, length = None ):
  sets = [ table[ key ] for key in keys ]
  candidates = reduce( lambda a, b: a & b, sets )
  if length:
    candidates = set( [ word for word in candidates if len( word ) <= length ] )
  return candidates

def update_counts( word, counts ):
  for letter in word:
    try:
      count = counts[ letter ]
    except KeyError:
      count = counts[ letter ] = { 'value' : 0 }
    count[ 'value' ] += 1  

def symbol_counts( words ):
  counts = dict()
  for word in words:
    update_counts( word, counts )
  return counts

def remove_entries( dic, keys ):
  for key in keys:
    try:
      del dic[ key ]
    except KeyError:
      pass
  return dic

def mask_to_keys( mask ):
  """ Get the keys from a mask, such as **PP* """
  keys = produce_keys( mask )
  keys = filter( lambda k: k[ 1 ] != '*', keys )
  return keys

def mask_to_letters( mask ):
  """ Get the letters in a mask """
  letters = filter( lambda l: l != '*', mask )
  return letters

def sort_counts( counts ):
  counts = [ x for x in counts.iteritems() ]
  counts = sorted( counts, key = lambda c: c[ 1 ][ 'value' ] )
  return counts

if __name__ == "__main__":
  words = get_words()
  print 'Building table...'
  table = index_all_words( words )
  print 'Table built.'
  mask = '**PP*'
  keys = mask_to_keys( mask )
  print keys
  result = query( keys, table, len( mask ) )
  print result
  counts = symbol_counts( result )
  letters = mask_to_letters( mask )
  print letters
  counts = remove_entries( counts, letters )
  counts = sort_counts( counts )
  print counts

