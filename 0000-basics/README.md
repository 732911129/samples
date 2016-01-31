# basics

1. TypeChecking.
2. Decorators.
3. Logging.
4. Partial classes.
5. Modules. 
6. Mixins / Prototypal delegation / Multiple Inheritance.
7. DataFlow.

# TypeChecking

```js
  class Adder {
    
    [T `add ${{ a : Number }} ${{ b : Number }} -> ${{ Number }}`] 
    
    ( a, b ) {
      const sum = a + b;
      
      return sum;
    }
    
    
    [T `add ${{ a : Array }} ${{ b : Array }} -> ${{ Array }}`] 
    
    ( a, b ) {
      const sum = [ ...a, ...b ];
      
      return sum;
    }
    
    
    [T `add ${{ a : Function }} ${{ b : Function }} -> ${{ Function }}`] 
    
    ( a, b ) {
      const sum = ( ...args ) => a( b( ...args ) );
    
      return sum;
    }
  }
  
  Type(Adder);
  
  adder = new Adder();
  
  adder.add(1,2); // 3
  adder.add([1],[2,3]); // [1,2,3]
  adder.add( x => x + 1, y => y + 2 ); // z, z(0) == 3
```
