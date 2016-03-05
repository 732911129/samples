import math

key_table = dict()
length_table = dict()
alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
all_letters = set( [ l for l in alphabet ] )

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

def index_word( word, table, len_table ):
  length = len( word )
  try:
    word_set = len_table[ length ] 
  except KeyError:
    word_set = len_table[ length ] = set() 
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
    index_word( word, key_table, length_table )
  return table

def overlap( lettersa, lettersb ):
  return len( set( lettersa ) & set( lettersb ) )

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
  counts = sorted( counts, key = lambda c: ( c[ 1 ][ 'value' ] ), reverse = True )
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

def retrieve_words( key, length ):
  return set( [ w for w in key_table.get( key, set() ) if len( w ) == length ] )

def correct_guess_sets( words, keys, length ):
  correct = dict()
  words = set( words )
  empty = set()
  total_words = float( len( words ) )
  for key in keys:
    letter = key[ 0 ]
    try:
      correct_sets = correct[ letter ] 
    except:
      correct_sets = correct[ letter ] = { 
          'p' : 0.0,
          'keys' : dict(), 
          'words' : set(),
          'entropy' : 0.0 
        }
    key_words = words & retrieve_words( key, length )
    total_key_entropy, total_letter_entropy = calculate_total_entropies( key_words )
    correct_sets[ 'keys' ][ key ] = { 
        'entropy' : total_key_entropy,
        'words' : key_words 
      }
    correct_sets[ 'words' ] |= key_words
  for letter in correct:
    correct_sets = correct[ letter ]
    key_set = correct_sets[ 'keys' ]
    letter_words = correct_sets[ 'words' ]
    total_letter_words = float( len( letter_words ) )
    correct_sets[ 'p' ] = total_letter_words / total_words
    for key in key_set:
      key_score = key_set[ key ]
      key_score[ 'p' ] = p_key = len( key_score[ 'words' ] ) / total_words
      correct_sets[ 'entropy' ] += p_key * key_score[ 'entropy' ]
  return correct

def incorrect_guess_sets( words, letters ):
  incorrect = dict()
  total_words = float( len( words ) )
  for letter in letters:
    letter_words = [ w for w in words if letter not in w ] 
    total_key_entropy, total_letter_entropy = calculate_total_entropies( letter_words )
    if total_words:
      p = len( letter_words ) / total_words 
    else:
      p = 0.0000001
    incorrect[ letter ] = { 
        'p' : p,
        'words' :  letter_words, 
        'entropy' : total_key_entropy 
      }
  return incorrect

def calculate_letter_scores( words ):
  keys = [ key for word in words for key in produce_keys( word ) ]
  key_counts = count_keys_per_key( keys )
  letter_scores = dict()
  total_keys = float( len( keys ) )
  total_words = float( len( words ) )
  for key in key_counts:
    count = key_counts[ key ][ 'value' ]
    letter = key[ 0 ]
    try:
      letter_score = letter_scores[ letter ]
    except:
      letter_score = letter_scores[ letter ] = { 
          'total_keys' : 0.0, 
          'keys_entropy' : 0.0,
          'letter_entropy' : 0.0,
          'p' : 0.0,
          'keys' : dict() 
        }
    try:
      key_counter = letter_score[ 'keys' ][ key ] 
    except:
      key_counter = letter_score[ 'keys' ][ key ] = { 'value' : count }
    letter_score[ 'total_keys' ] += count
  for letter in letter_scores:
    letter_score = letter_scores[ letter ]
    total_letter_keys = letter_score[ 'total_keys' ]
    p_letter = total_letter_keys / total_keys 
    letter_score[ 'p' ] = p_letter
    letter_score[ 'letter_entropy' ] = -math.log( p_letter ) * p_letter
    letter_keys = letter_score[ 'keys' ]
    for key in letter_keys:
      key_counter = letter_keys[ key ]
      p_key = key_counter[ 'value' ] / total_keys
      letter_score[ 'keys_entropy' ] -= p_key * math.log( p_key )
  return letter_scores

def calculate_total_entropies( words ):
  letter_scores = calculate_letter_scores( words )
  total_keys_entropy = 0.0
  total_letter_entropy = 0.0
  for letter in letter_scores:
    letter_score = letter_scores[ letter ]  
    total_keys_entropy += letter_score[ 'p' ] * letter_score[ 'keys_entropy' ]
    total_letter_entropy += letter_score[ 'p' ] * letter_score[ 'letter_entropy' ]
  return ( total_keys_entropy, total_letter_entropy )

def get_backup( len_table, length_ceiling ):
  model_len = length_ceiling
  candidates = set()
  while( model_len not in len_table and model_len ):
    model_len -= 1
  if model_len:
    floor_len = max( 1, model_len - 3 )
    while( model_len >= floor_len and model_len > 0 ):
      try:
        candidates |= len_table[ model_len ]
      except:
        floor_len -= 1
      model_len -= 1
  return candidates

def query( mask, table, len_table, length = None, tried = '' ):
  keys = mask_to_keys( mask )
  excluded = set( tried ) - set( mask_to_letters( mask ) )
  sets = [ table[ key ] for key in keys if key in table ]
  if not sets:
    fallback = candidates = get_backup( len_table, length )
  else:
    candidates = reduce( lambda a, b: a & b, sets )
    fallback = reduce( lambda a, b: a | b, sets )
    if length:
      candidates = set( [ word for word in candidates if len( word ) == length  ] )
      fallback = set( [ word for word in fallback if len( word ) == length  ] )
  if excluded:
    candidates = set( [ word for word in candidates if overlap( word, excluded ) == 0 ] )
  return ( candidates, fallback )

def calculate_entropy_deltas( correct, incorrect ):
  guess_deltas = dict()
  letters = set( correct.keys() ) & set ( incorrect.keys() )
  for letter in letters:
    correct_scores = correct[ letter ]
    incorrect_scores = incorrect[ letter ]
    correct_entropy = correct_scores[ 'entropy' ]
    incorrect_entropy = incorrect_scores[ 'entropy' ]
    correct_p = correct_scores[ 'p' ]
    incorrect_p = incorrect_scores[ 'p' ]
    guess_deltas[ letter ] = { 
      'value' : correct_p * correct_entropy + incorrect_p * incorrect_entropy 
    }
  return guess_deltas

def get_guesses( words, remaining_letters, length ):
  keys = [ key for word in words for key in produce_keys( word ) ]
  unique_keys = set( keys )
  correct_guesses = correct_guess_sets( words, unique_keys, length )
  incorrect_guesses = incorrect_guess_sets( words, remaining_letters )
  return ( correct_guesses, incorrect_guesses )

def get_entropies( words, remaining_letters, length ):
  correct_guesses, incorrect_guesses = get_guesses( words, remaining_letters, length )
  entropy_deltas_per_guess = calculate_entropy_deltas( correct_guesses, incorrect_guesses )
  sorted_deltas = sort_counts( entropy_deltas_per_guess )
  total_key_entropy, total_letter_entropy = calculate_total_entropies( words )
  return sorted_deltas, total_key_entropy, total_letter_entropy

def guess( mask, already_tried ):
  remaining_letters = all_letters - set( already_tried )
  words, fallback = query( mask, key_table, length_table, len( mask ), already_tried )
  sorted_fallback_deltas = []
  length = len( mask )
  sorted_deltas, total_key_entropy, total_letter_entropy = get_entropies( words, remaining_letters, length )
  if not sorted_deltas:
    sorted_fallback_deltas, total_key_entropy, total_letter_entropy = get_entropies( fallback, remaining_letters, length )
  val = {
    'total_key_entropy' : total_key_entropy,
    'total_letter_entropy' : total_letter_entropy,
    'guesses' : sorted_deltas,
    'fallback' : sorted_fallback_deltas
  }
  print val
  return val

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
