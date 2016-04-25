# Development

## Server Architecture Iteration Number 1

### Dispatcher

  A Dispatcher, implemented by public Response serve.

  The dispatch matches the URI to a route string, and calls 
  the corresponding Service.

### Service

  Service has a serve method. 

  The response of the called service's serve method is the return result of the Dispatcher.

## Services Architecture Iteration Number 1

  - Reader service ( just returns the text value of a file in the "front" directory of any filename you pass it )
    - Implemented by Files.lines
  - Unzip service ( just unzips and returns the directory tree of any zipfile blob you pass it )
    - Implemented by Runtime.
  - Compile service ( just returns the jar file, and compile output including errors, of the compilation of any directory tree you pass it )
    - Implemented by Runtime and a custom compile to jar shell script.



