# basics

1. TypeChecking.[[ name : AURELIUS ]]
2. Decorators.[[ name : FILIGREE ]]
3. Logging.[[ name : NSA ]]
4. Partial classes.[[ name : CLASSLEGOS ]]
5. Modules. [[ name : TEAMBUILDER ]]
6. Mixins / Prototypal delegation / Multiple Inheritance. [[ name : DIVERSIFY ]]
7. DataFlow. [[ name : QUICKSILVER ]]

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

# Decorators


# Logging

We use Proxy objects for logging. As well as decorators. 
