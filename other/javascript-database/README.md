# javascript-database

A cross browser database using web storage, with fallbacks to window.name and document.cookie.

## why?

Sometimes data is cached when the network is not performant. The web application can continue to run in such cases.

## how?

Form submit's are intercepted by javascript, and a series of server patches are built by such interactions, which can be sent to the server when normal network operations resume.

## why the basic web storage, and fallback infrastructure?

The main purpose of this is to enable operation the widest range of devices.

## so tell me again what the purpose is?

The only purpose of this thing is to faciliate functioning of the application when there is no network. To this end, it intercepts server requests, combines them into patches, renders the resulting simulated server response, and dispatches the patches to the server once connection is re-established. It is a server proxy for times when there is no network. There is no other purpose to this. The only database we care about is in the cloud, and the only use we have for this client side database is to store updates until the cloud can be connected to again.

## parts 

- Detect if there is no internet
- Intercept requests ( catch form submission )
- Build patches ( combine two requests into one )
- Store patches ( using the web storage or its fallback )
- Render simulated responses ( access views, and model patches, and perform client side rendering )


