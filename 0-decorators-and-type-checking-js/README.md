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

Use the `T` function ( T is for type, also aliased to `_` if you think that looks better ), to provide type checking ( and polymorphism, otherwise known as type signature overloading ), for any method of a class or object with *this* simple syntax:

```js
class Pear {
  // 
  [ T`type_checked${{ a : String, b : Integer }} ${ Array }` ]( a, b ) {
    //
  }
  [ T`type_checked${{ a : String, b : Integer, c : Array }} ${ Array }` ]( a, b, c ) {
    //
  }
  //
}

T(Pear)
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



