# syntax experiments

considering some other syntaxes for decorators:

```js
class Human {
  [ D`love ${ dec1 }` ](){}   // #1
  [ D`${ dec1 } love` ](){}   // #2
  [ dec1`love` ](){}          // #3
  [ dec( dec1 )`love` ](){}   // #4
  love( other_human ) {
    // important things go here
  }
}
```

my feeling is we already have the correct syntax, being numbers 3 and 4.

