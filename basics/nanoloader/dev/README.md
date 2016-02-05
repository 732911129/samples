# Module Loader

# Syntax

Requesting modules looks like this:

```js
"use strict";

{
  using.
    module1.
    module2.
    module3.
    lastModule();

  // code that uses those
}
```

And exporting modules looks like this:

```js
"use strict";

{

  // code that creates things to export
  
  exporting = {
      class1,
      class2,
      fun1,
      constant1
    };
}
```

These exported parts are assigned the slots on the module name space, which is the file name of the module, and which must be unique since everythign is flat, named by the keys to which they are mapped in the export object.

## Details

Both `using` and `exporting` are slots on the global object.

`using` is a getter that returns Proxy that traps all properties given to it and returns itself.

`exporting` is a setter that accepts an object and records that the entries of that object are to be the exports of the current module.

Finally, the module loader prepares a pre-pass of all files to build the dependency tree. This pre pass is indicated by an internal flag. When this flag is set the returned proxy, if given the call trap, notice the final function call on `finalModule` will then throw an error to break out of loading the rest of the file. There's not point to load the file since no dependencies have yet been loaded. And the call trap on the proxy triggering the throw is a way to exercise control over when the file is run separate to when it is loaded. It is also a way to separate the dependency requesting code, from the other code in the module, without explicitly invoking some external parser. It's a neat solution.

This is really an ES6 modules parafill. Not a polyfill, a *para* fill. As in *ortho-, meta-, para-*, being something not quite congruent and yet similar and almost the same. 

## Coroutine Loader

```js
  <file_name> == <module_name>

  <file_name>.js :

  "use strict";

  self.loaders.<module_name> = (function *() {
    yield 'moduleA moduleB moduleC moduleD';

    // code

    yield { export1, export2, export3 }; 
    // or an object that will eventually bear the exports
    // once any asynchronous tasks have completed
  }());
```
