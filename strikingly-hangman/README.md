ICED


# what is this?

The progress tracking README for my creation for the Strikingly Hangman programming test.

## other models

Another model of hangman could train on letter trigams ( or other n-grams ) inside words, and learn things like:

  if we have *A* the next letter is most likely to be K
  in other words given some trigram ( which can include * ), we can easily learn the distribution of the next letter from the dictionary. 
  the cool thing about this is it can handle unknown words. 

## what i like about this

The thing I like about hangman is it's very general. It's really just optimal codes and reconstruction fo words, given some alphabet and dictionary. The trick of hangman lies in that not all possible combinations of letters ( all words for an alphabet ) are present. The cool thing about it is it's really a way of optimally thinking about the structure of the dictionary. If you can do hangman optimally ( the absolute minimal number of moves ), then you optimally understand ( deeply understand ), the structure of the dictionary. That's cool.

## improvement ideas

- A measure of how it splits the set. Yes we take the number of different arrangements for a letter. Yet what if we also score them by how many different words correspond to those arrangements. The size of the subset that letter is involved in could also be part of the scoring. Or the entropy of the distribution of that subset ( as in, sum of the product of probabilities and their log of each of the arrangements ). 
- Also a measure that says how many guesses we have left. 
- I know there is some way of doing this like an optimization function. Like linear optimization.  Given these splitting powers, and the number of guesses remaining we can find an optimum next guess. We can score it somehow. 

## improvement ideas

- As well as the letter that maximally splits the set, it would also work to consider letters by their frquency. Since ther are a limited number of guesses available. 
- It will likely work to experiment ways to combine splitting power and commoness. 

## improvement ideas

- Try two things, change coefficient to 4.25 and 0.75
- And do squaring.
- I want to do a Bayes one. I really feel this is a game which works to be player from a Bayes inspired model. 

## improvement ideas

- Rather than just sorting by frequency, I think we should sort by surprise, or entropy. Like, the entropy of a letter occuring, being somehow the probability of a letter in such a context general context (word of that legnth or with union, versus the probability of it occurring in that specific context ) 
- SOrt by that.
- Guess based on highest information content.
- like how much do the new letters shift the probabilities from their expected values. 
- or we could use bayes. Like how much is our expectation updated. 


## improvement ideas
  
  - It's not about the most frequent letter, it's about the letter that maximally splits the subset. 
  - The letter that leads the subsets to shrink fastest, while maintaining the likelihood the word will be in them. Maybe the mean, or median, or letter with the closes to the mean ? 
  - Tried mean * 2, seems to be okay. 
  - Gonna submit zip file now, submit code later with maybe a few more tweaks. 

## improvement ideas

  - Always do vowels first
  - bigger word list
  - relax length restriction
    - this does not work
  - There are a few stages of game. Vowel stage.
    - Choose vowels until word is saturated with vowels. 
    - Then choose consonants. 
    - Sometimes the returned order is not correct. 
    - It makes sense to order by information content. Like the ordering should be a product of the frequency in this set, and the inverse frequency of the letter over all. Like term frequency inverse document frequency.
  - Okay remove vowel sort.
  - Improve indexing. Indexes must not separate identical letters.
  - In terms of scoring frequencies I think we should square the number of times a letter appears in a word. Since double letters are more valuable to us.- Significant improvements with new word list, new indexing ( a key is a letter and all its positions which is way more specific ), and increasing the weight of letters that occur in a word more than once.

  - Fallback:
    -- When a word is not in the dictionary, we need to fall back on a model.
    -- So basically our model is we build up freuqnecy distributions of words that partially match our indexes. 
    -- Let's try to get a bigger word list first.
    -- The model, the simple version, is just taking the union of the indexed word sets, and calculating a frequency over those. So if the intersection is empty, we still have a model. 
    -- And if the union is empty, then just use the english frequencies. 
    -- Okay, let's try to improve the fallback. Some configurations we can alter:
      -- Do we use discounted positions on fallback ? I intuit no, and it may work to experiment. 
      -- Do we use length restriction on fallback ? I intuit no, and it may work to experiment.
## todo

  - DONE - sketched first part of index server.
  - make API in ruby to query index server and the hangman game server
  - make front end

## product

  1. Python API to do word guessing.
  2. Ruby script to run APIs: python API, and game API.
    - Can play autonomously just selecting the best guess.
    - Can allow human input to see the best guesses, select one, or select something else. 
  3. JS/HTML/CSS front end. 

## progress plan

  1. Implemented basic parts of strategy.
    1. Indexing a word list.
    2. Finding candidates.
    3. Collecting the counts of those candidates.
    4. Sorting the counts.
  2. This strategy will work where we have a non zero set of candidates.
  3. Some improvements:
    1. Compute the letter counts only over the positions that are masked. 
    2. Remove from the letter counts those letters which have already been guessed ( correctly and incorrectly )
  4. A fallback when the candidates set is empty is to use a global frequency count that we build over the whole word list.
  5. A fallback that may work better is to perform various relaxings of the query parameters so that the candidate set can be non zero. Some ideas for these parameter relaxings are:
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



