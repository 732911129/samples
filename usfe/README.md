# usfe - ultra simple framework experiment - tiny framework plan

# todo

- create all services ( echo, get, find, search, patch ).
  - DONE create API console
  - DONE create patch
  - DONE ISSUE
    - What happens is that models do not have a model class when they are loaded from key since we never import such a class.
    - We could execute some python for this case...however what's the point?
    - We can just use our general model, media, with slots. 
    - This works. So we will go back to using our slots model, and saving the kind in the top. Nice. 
    - The methods for apply patch will need to change to reflect the nature of the slots of the media model. 
  - DONE implement media model for USFE datastore. NICE. 
  - decide format for find and for search
  - create find
  - create search
- Handle parsing of nested templates ( so we can template the whole app, and the print it from that ).
- Add a ":-style-with" attribute which can contain space separate URIs that are to be, if they have not already been, loaded as styles into the document.head
- Work on the server so the server and client work together. 
  - things to maybe consider:
  - namespaces in the uris for server requests somehow put into an attribute in the app
  - like the request uris within the app may be relative to some base uri that contains the app namespace and api version
  - as soon as possible do a sample app, such as tree builder ( tree nodes can contain tree nodes or leaves ).
- Find a way to include version / file version / build version information in the URIs of resources we get the browsers to request. This way we can get optimum caching and always up to date resources.
- see how we can use navigator.sendBeacon [ perhaps as another option for request ( ? WS, SSE, HTTP response, Beacon ? )


# Idea

- Use a single function to do the only thing we need to do, extend Element.prototype with this function, `main`
- This function must be executed on all tagged nodes added to the DOM. 
- The way to do this is to walk the tree when the loading script is initially done, then observe any DOM mutations, and run the functions, when nodes are added.
- We can add an attribute that determines if we use HTTP, or SSE, or WS. Or something else. It's so cool to think that we could have a single function that links to a SSE source and publishes new data into a view as that data is pushed down the SSE source.
- What if we curtail the DOM, so we curtail the ways we can modify the DOM, by patching the methods. Like what if we disallow all types of DOM modification, and only allow certain types of DOM modification. That's pretty cool. Like a single function to modify the DOM, and nothing else works to do it. So we know that the only way the DOM gets modified is through that 1 function. Pretty cool. The DOM itself is like a database. Perhaps it works to treat it like that. More transactional. More precise. Let's not permit modifying it in ways that don't respect it's structure. That kind of action is similar to type unawares manipulation of data. It's sloppy, it's lazy and it can lead to errors. Let's respect the DOM, and its structure. Yes. Yes. Let's really embed data structure into the DOM, and only modify the DOM to reflect different data structures, could be one approach. Not modify the DOM itself at all. Just when we modify some data then the DOM is modified. Or -- we could permit some modifictions of the DOM outside of data modification, and then we curtail and control what they are. Managed DOM. 


# Implementation

- Seems to be going okay. First test is validated.

# Principles of USFE

- State is in models
- Server is good at responding
- Client is good at presenting
- Server only needs four routes
- /get/<codes>
- /find/<slot_expressions>
- /search/<full_text_queries>
- /patch
  POST BODY : <patches>

# Insights

- The cycle of humans perfecting the database : push data to human, human perfects it, push data back to database, database is being perfected. Humans are basically slaves perfecting databases. 


