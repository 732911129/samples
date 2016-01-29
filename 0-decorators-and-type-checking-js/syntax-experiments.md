# syntax experiments

considering some other syntaxes for decorators:

```js
class Human {
  [ D`love ${ dec1 }` ](){}         // #1
  [ D`${ dec1 } love` ](){}         // #2
  [ dec1`love` ](){}                // #3
  [ dec( dec1 )`love` ](){}         // #4
  [ decorate`love ${ dec1 }` ](){}  // #5
  [ $( dec1 )`love` ](){}           // #6
  [ $.dec1`love` ](){}              // #7
  love( other_human ) {
    // important things go here
  }
}
```
## thoughts and feelings

- my feeling is we already have the correct syntax, being numbers 3 and 4.
- #7 is quite nice, since the $ could be said to make it explicit we are doing decorating. It would however requires something like:
  - `$.registerDecorator( dec1 )`



