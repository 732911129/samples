# what is this?

The progress tracking README for my creation for the Strikingly Hangman programming test.

## progress

1. Implemented basic parts of strategy.
  1. Indexing a word list.
  2. Finding candidates.
  3. Collecting the counts of those candidates.
  4. Sorting the counts.
2. This strategy will work where we have a non zero set of candidates.
3. A fallback when the candidates set is empty is to use a global frequency count that we build over the whole word list.
4. A fallback that may work better is to perform various relaxings of the query parameters so that the candidate set can be non zero. Some ideas for these parameter relaxings are:
  1. Take the union of sets instead of intersection.
  2. Relax the length paramter ( length + 1, length + 2, or no length )
  3. Do a pair wise incremental intersection of sets in order of decreasing size, and stop when the set drops below a certain threshold. 
  4. Do 3, and stop when some information measure of the frequency count distribution of the set drops below a certain threshold. 

## sketched strategy

0. Use a word list.
  - Index all words by their letter positions.
    - For example HAPPY will have, among it's indexes, P,2 -> HAPPY , P-3 -> HAPPY
1. Use ETANORISH order and random order guessing.
  - For initial guesses try the following strategies:
  - Alternate ETANORISH and random guesses.
  - Try ETANORISH only.
  - Tray random only.
  - Try some other distribution combining ETANORISH and random. 
  - The above process can optimize against their selection of words, in case any adversarial choices are made ( such as words with no letters in the first places of the list of frequent letters  ).
2. Strategy is like this:
  1. For the current work mask, collect the lists of words indexed by  all revealed word positions, so.
    - For example **PP* collect:
      - P,2
      - P,3
  2. Now take the intersection of those lists to produce a list of candidates.
    - If there is only one candidate, guess that word if such a guess is possible.
  3. Now take a letter frequency count over the list of candidates. 
  4. Now remove those letters already present in the mask.
  5. Take as the next guess, the most frequent letter in the candidates that remains.

## alternatives and improvements

- Consider adding words that are not in the word list, to the index, once they are discovered. ( adaptive index )
- Consider updating the ETANORISH ordering to reflect the letter frequency distribution of the words seen from the system. ( adaptive frequency )


  
  

