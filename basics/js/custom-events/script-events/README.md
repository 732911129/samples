# script events

a polyfill for beforescriptexecute and afterscriptexecute, using arrows, coroutines, block scope, const, let, Symbols, destructuring, template strings.

## requirements

a browser that can run the above es6 features. 

## usage

```html
<script src=scriptevents.js></script>
```

```js
document.addEventListener('beforescriptexecute', e => {
    if ( e.target.src && e.target.src.includes( 'cdn' ) ) e.preventDefault();
  } );
  
reload_with_scriptevents();
```

Then any scripts with a 'cdn' somewhere in their URI will not be run.

`BREATHER` sets the time in ms that is yielded to the browser to do its tasks at each step. 

If your page used POST, you can recreate it like

```js
reload_with_scriptevents( { reset_type : 'POST', 
    request_body : JSON.stringify( my_page_payload ) } ); 
```

### reset_type

The reset_type slot in the configuration object passed to `reload_with_scriptevents` can be either "innerHTML", "GET", or "POST". Using "innerHTML" is not the same as requesting the document again from the server with "GET" or "POST". This is because some nodes may have been inserted into the document after being received by the client, and so will be present in the innerHTML and not in the server response. 
