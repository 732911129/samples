# Development

## Server Architecture Iteration Number 1

### Dispatcher

A Dispatcher, implemented by public Response serve.

The dispatch matches the URI to a route string, and calls 
the corresponding Service.

### Service

Service has a serve method. 

The response of the called service's serve method is the return result of the Dispatcher.



