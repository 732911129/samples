# decorators and type checking from ES2015 classes, and template strings.


## format


### decorators

Decorate any method in a class or object with this simple syntax: 

```js
class Apple {
  //
  [ decorator`decorated_function` ](){}
  decorated_function() {
    //
  }
  //
}
```

to make a decorator we need to write a function like this ( just like in Python ):

```js
function dec1( fun ) {
  function wrapper() {
    // some logic, tho basically it follows a pattern like this
    const 
      // do something before we call the function, say
      modified_arguments = somehow_modify_arguments( arguments ),
      // then call the function 
      results = fun( ...modified_arguments ),
      // then do something after we call the function, say 
      modified_results = somehow_modify_results( results );
      // then return, say
    return modified_results;
  }
  return wrapper;
}
```

Finally in order to turn that into a decorator we can use, one more step is required:

```js
const dec1_decorator = decorator( dec1 );
```

And that's it! Now we can use it like so:

```js
class Orange {
  //
  [ dec1_decorator`eat` ](){}
  [ dec2_decorator`eat` ](){}
  [ decorator( dec3 )`eat` ](){}
  eat() {
    // something
  }
  //
}

apply_decorators(Orange);
```

And the methods or Orange, suitably decorated, are ready to use.

### type checking

Use the `T` function ( `T` is for type, also aliased to `_` and also `def` if you think that looks better ), to provide type checking ( and polymorphism, otherwise known as type signature overloading ), for any method of a class or object with *this* simple syntax:

```js
class Pear {
  // 
  [ T `type_checked ${{ a : String, b : Integer }} -> ${ Array }` ]( a, b ) {
    //
  }
  [ T `type_checked ${{ a : String, b : Integer, c : Array }} -> ${ Array }` ]( a, b, c ) {
    //
  }
  //
}

```

Dispatch happens automatically:

```js
const a1 = apear.type_checked( 10, 'Apples' ), // ok 
  a2 = apear.type_checked( 20, 'Pears', [ 'Orange', 'Orange' ] ), // ok 
  a3 = apear.type_checked( 30, 'Durians', [ 'Banana', 'Banana' ], true );
  // not ok
  // throws TypeError( `unexpected argument true in position 4` );
```

Another example:

```js
const b1 = apear.type_checked( {}, 'Guava', [ 'Catnip', 'Catnip' ] ); 
// also not ok
// throws TypeError( `parameter 'a' is declared 'String', and was passed type 'Object'`);
```

If you don't want overloading you can use the regular method decorator syntax :

```js
class Pear {
  //
  [ T `type_checked ${{ a : String, b : Integer, c : Array }} -> ${ Array }` ](){}
  type_checked( a, b, c ) {
    //
  }
  //
}
```
