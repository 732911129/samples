# nanoloader 

**v 0.1**

A nanoscopic ES2015 loader that uses coroutines and weighs 60 SLOC. 

## Contents

* [Philoshophy](#philosophy)
* [nano module format](#nano-module-format)
* [Using nanoloader](#using-nanoloader)
* [Customizing](#customizing)
* [Technical Details](#technicald-details)
  * [Loading](#loading)
  * [Format](#format)
  * [Cleaner Decoupling](#cleaner-decoupling)
* [Road Map](#road-map)
* [Min Browser](#min-browser)
* [Why use instead of AMD / RequireJS?](#why-use-instead-of-amd--requirejs-)
* [nano modules](#nano-modules)
  * [how would this work?](#how-would-this-work-)

## Philosophy

Smaller is better. 

*This README.md file is longer than all the code for `nanoloader`.*

## nano module format

`BeefTacoModule` is wrapped in a coroutine. 

```js
// BeefTacoModule.js

self.loader.BeefTacoModule = (function *() {

  // requirements like 
  
    yield 'Beef Cheese Lettuce Chef';


  // module code 
  
    const MEAT = module.Beef; 
  
    const { Beef, Cheese, Lettuce } = module; // shorter
    
    function taco() {
      return Chef.mix( Beef.grams( 500 ), Cheese.grams( 500 ), Lettuce.grams( 250 ) );
    }
  
  // exports like 
  
    yield { taco, MEAT };
  
}());
```


## Using nanoloader

Load the single file, and use `requestModule`.

```html
<script src=nanoloader.js></script>
<script>
  console.info( 'App is loading...' );
  requestModule( 'app.js', () => console.info( 'App is loaded' ) );
</script>
```

## Customizing

The `path` function is easily modified to use your module base URI.

*For example:*

Change:

```js
function path( name ) {
  return name + '.js';
}
```

Into:

```js
function path( name ) {
  return BASE_URI + name + '.js?decache=' + Math.random();
}
```

## Technical Details

### Loading

Running nanoloader's `requestModule` function on a module name, effectively causes a post order travesal of the dependency graph, while ignoring any cyclic dependencies as they are listed as already loading by their inclusion in the `loader` map. 

### Format

Each nano module is wrapped in a coroutine. These coroutines have two `yield` statements. 

The return value of the first `yield` is how dependencies are requested. The return value of the second `yield` is how exports are returned.

```js
(function *() {

  // immediately invoked coroutine expression IICE
  
  // the result of this is a coroutine, that, 
  // when its next method is called, will execute until...
  
  yield 'return value of first next call'; // ...here.
  
  // once next is called a second time 
  // everything below the first yield is run
  
  // until...
  
  yield 'return value of second next call';  // the second yield
  
}());
```

### Cleaner Decoupling 

This coroutine wrapper, with its two `yield` statements, provides a way to decouple the module from its dependencies and exports. 

Specifically, it decouples:

1. Dependency requests.
2. Dependency loading.
3. Module code execution.
4. Exports.

The two `yield` statements are how this decoupling is achieved.

The first `yield` statement provides an exit point for requirements, and an entry point to re-enter the module function and execute the module code, once those requirements are determined to be loaded. 

The second `yield` statement provides an exit point for the module's exports.

## Road Map

None. 

## Min Browser

Arrow functions and coroutines. 

*In February 2016, that's everything except Safari.*

## Why use instead of AMD / RequireJS ?

Smaller is better. 

# nano modules

What if we make each function or property in a module its own export in its own nano module?

## How would this work?

```js
// utils/<version>/flatten_map_of_lists.js:
self.loader.utils.flatten_map_of_lists = (function*(){

  yield 'utils.append';
  
  const { append } = module.utils;
  
  // alternately:
    // const { append } = yield 'utils.append';

  function flatten_map_of_lists( map ) {
    return Object.
      keys( map ).
      reduce( 
          ( all, key ) => append( all, ...map[ key ] ),
          [] 
        );
  }

  yield { flatten_map_of_lists };

}());
```

The thing is, utils.append, up there is also a nano module. Just a one file module with its own single export. 

