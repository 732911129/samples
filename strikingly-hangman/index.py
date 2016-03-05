import math

table = dict()
length_table = dict()
def get_words():
  with open( 'words.txt', 'r' ) as words_file:
    words = set( [ x.strip().upper() for x in words_file.readlines() ] )
  return words
 
def produce_keys( word ):
  raw_keys = zip( range(len(word)), word )
  new_keys = []
  letters = {}
  for key in raw_keys:
    try:
      positions = letters[ key[ 1 ] ]
    except KeyError:
      positions = letters[ key[ 1 ] ] = []
      new_keys.append( [ key[ 1 ], positions ] )
    positions.append( key[ 0 ] )
  keys = [ tuple( [ k[ 0 ], tuple( k[ 1 ] ) ] ) for k in new_keys ]
  return keys

def index_word( word, table ):
  length = len( word )
  try:
    word_set = length_table[ length ] 
  except KeyError:
    word_set = length_table[ length ] = set() 
  word_set.add( word )
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

def overlap( lettersa, lettersb ):
  return len( set( lettersa ) & set( lettersb ) )

def query( mask, table, length = None, tried = '' ):
  keys = mask_to_keys( mask )
  excluded = set( tried ) - set( mask_to_letters( mask ) )
  sets = [ table[ key ] for key in keys if key in table ]
  if not sets:
    model_len = len( mask )
    while( model_len not in length_table and model_len ):
      model_len -= 1
    if model_len:
      fallback = candidates = length_table[ model_len ] 
    else:
      candidates = fallback = set()
  else:
    candidates = reduce( lambda a, b: a & b, sets )
    fallback = reduce( lambda a, b: a | b, sets )
  if length:
    candidates = set( [ word for word in candidates if len( word ) == length  ] )
    fallback = set( [ word for word in fallback if len( word ) == length  ] )
  if excluded:
    candidates = set( [ word for word in candidates if overlap( word, excluded ) == 0 ] )
    fallback = set( [ word for word in fallback if overlap( word, excluded ) == 0 ] )
  return ( candidates, fallback )

def update_counts( word, counts, discounted_positions = {} ):
  """ Square the count per word to value larger frequencies more highly """
  word_counts = {}
  total = 0
  for position, letter in enumerate( word ):
    if position in discounted_positions:
      continue
    else:
      try:
        count = word_counts[ letter ]
      except KeyError:
        count = word_counts[ letter ] = { 'value' : 0 }
      count[ 'value' ] += 1  
  for letter, counter in word_counts.iteritems():
    if letter not in counts:
      counts[ letter ] = { 'value' : 0 }
    counts[ letter ][ 'value' ] += counter[ 'value' ] 
  total += len( word )  
  return total

def symbol_counts( words, discounted_positions = [] ):
  counts = dict()
  total = 0
  for word in words:
    total += update_counts( word, counts, discounted_positions )
  for k in counts:
    # information content by probability of any word
    counts[ k ][ 'value' ] = ( 1.0 / float( total ) ) * math.log( float( total ) / counts[ k ][ 'value' ] )
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
  keys = filter( lambda k: k[ 0 ] != '*', keys )
  return keys

def mask_to_positions( mask ):
  """ Get the positions in a mask """
  revealed_positions = filter( lambda k: k[ 1 ] != '*', mask_to_keys( mask ) )
  positions = [ x[ 0 ] for x in revealed_positions ]
  return positions

def mask_to_letters( mask ):
  """ Get the letters in a mask """
  letters = filter( lambda l: l != '*', mask )
  return letters

def sort_counts( counts, mask = None ):
  """ We sort by the frequency of the candidate words
  Then by the overall frequency of letters in English """
  counts = [ x for x in counts.iteritems() ]
  counts = sorted( counts, key = lambda c: ( c[ 1 ][ 'value' ] ) )
  return counts

def count_keys_per_letter( key_set ):
  counts = dict()
  for key in key_set:
    try:  
      count = counts[ key[ 0 ] ]
    except:
      count = counts[ key[ 0 ] ] = { 'value' : 0 }
    count[ 'value' ] += 1
  return counts

def count_keys_per_key( keys ):
  counts = dict()
  for key in keys:
    try:  
      count = counts[ key ]
    except:
      count = counts[ key ] = { 'value' : 0 }
    count[ 'value' ] += 1
  return counts

def calculate_letter_entropies( keys, words ):
  """ For each key, its probability is
  key_count / total_keys
  And its entropy follows
  For each letter, its entropy is
  - sum ( probability of key for letter, for all keys per letter )
  """
  key_counts = count_keys_per_key( keys )
  letter_scores = dict()
  letter_entropies = dict()
  letter_key_counts = dict()
  total_keys = 0
  total_words = float( len( words ) )
  total_entropy = 0
  for key in key_counts:
    count = key_counts[ key ][ 'value' ]
    letter = key[ 0 ]
    try:
      letter_score = letter_scores[ letter ]
    except:
      letter_score = letter_scores[ letter ] = { 
          'total' : 0, 
          'keys' : dict() 
        }
    try:
      key_counter = letter_score[ 'keys' ][ key ] 
    except:
      key_counter = letter_score[ 'keys' ][ key ] = { 'value' : count }
    letter_score[ 'total' ] += count
    total_keys += count
  for letter in letter_scores:
    letter_score = letter_scores[ letter ]
    letter_keys = letter_score[ 'keys' ]
    letter_entropy = letter_entropies[ letter ] = { 'value' : 0 }
    total = float( letter_score[ 'total' ] )
    p_letter = total / total_keys 
    letter_key_counts[ letter ] = { 'value' : p_letter }
    for key in letter_keys:
      key_count = letter_keys[ key ]
      p_key = key_count[ 'p' ] = key_count[ 'value' ] / total_words
      letter_entropy[ 'value' ] -= p_key * math.log( p_key )
    total_entropy += letter_entropy[ 'value' ]
  S = max( 1, total_entropy )
  for letter in letter_entropies:
    letter_entropy = letter_entropies[ letter ]
    E = letter_entropy[ 'value' ]
    p = letter_key_counts[ letter ][ 'value' ]
    # convert to ( pE ) + ( 1 - p ) ( S - E )
    letter_entropy[ 'value' ]  = E/S
  print letter_scores
  return letter_entropies, letter_key_counts

def merge_and_score( keys, words ):
  # return a set
  # sort then count 
  keys = sorted( keys, key=lambda c : ( c[ 0 ], c[ 1 ] ) )
  letter_entropies, letter_key_counts = calculate_letter_entropies( keys, words )
  return ( letter_entropies, letter_key_counts )

def guess( mask, already_tried, display_only = False ):
  candidate_words, fallback = query( mask, table, len( mask ), already_tried )
  letter_entropies, letter_key_counts = merge_and_score( [ key for word in candidate_words for key in produce_keys( word ) ], candidate_words ) 
  sorted_counts = sort_counts( remove_entries( letter_key_counts, already_tried ) )
  sorted_entropies = sort_counts( remove_entries( letter_entropies, already_tried ) )
  sorted_fallback_entropies = []
  if not sorted_counts:
    try:
      fallback_entropies, fallback_key_counts = merge_and_score( [ key for word in fallback for key in produce_keys( word ) ], fallback )
    except:
      unique_fallback_keys = set()
    sorted_fallback_entropies = sort_counts( remove_entries( fallback_entropies, already_tried ) )
  if not display_only:
    guesses = sorted( sorted_entropies, key = lambda c : ( 
        c[ 1 ][ 'value' ] )
      )
    fallback_guesses = sorted_fallback_entropies
    if not guesses:
      fallback_guesses = sorted( sorted_fallback_entropies, key = lambda c : ( 
          c[ 1 ][ 'value' ] ) 
        )
    val = { 
      'guesses': guesses, 
      'key_counts' : sorted_counts,
      'fallback': fallback_guesses
    }
    print val
    return val
  else:
    print 'Counts ', sorted_counts
    print 'Fallback ', sorted_fallback_counts

print 'Building table...'
table = index_all_words( get_words() )
print 'Table built.'

def main():
  import sys
  try:
    mask = sys.argv[ 1 ]
  except:
    return
  try:
    tried = sys.argv[ 2 ] or ''
  except:
    tried = ''
  guesses = guess( mask, tried ) 
  print guesses

if __name__ == "__main__":
  main()
