# todo

In order to start testing and using all these things, it's necessary to rewrite typechecking and decorators so they can be modules. 

Then it's necessary to host these modules somewhere ( say, media, and do so with some kind of auto build ). 

- It also works to factor out utils from type checkng and decorators into its own module.
- Then wrap typechecking and decorators so they can use the nanoloader.
- Then host them somewhere.
  - Possible hosting locations https://media.dosaygo.com/codebase/

# basics

0. Modules. [[ name : TEAMBUILDER ]]
1. Utils. [[ name : FUWU ]] 
2. TypeChecking.[[ name : AURELIUS ]]
3. Decorators.[[ name : FILIGREE ]]
4. Logging.[[ name : NSA ]]
5. Partial classes.[[ name : CLASSLEGOS ]]
6. Mixins / Prototypal delegation / Multiple Inheritance. [[ name : DIVERSIFY ]]
7. DataFlow. [[ name : QUICKSILVER ]]

# Modules

These are first. They have no dependencies. 

The way we do it is, server side, everything comes from static directory codebase

`https://media.dosaygo.com/codebase/js/<module_name>/<module_version>/code.js`

The reason we do this is so that we get optimal caching of the code files. We set cache expiry headers to never, and we make a new directory with a new version number when we update the code. We use the new version when we want to.

The question is how to we get module version to be the latest ( or whatever ) into our code?

There is another resource :

`https://media.dosaygo.com/versions/<version>/js.json`

This resource contains a line by line list of latest version numbers of all our javascript files. 

We can then, in the module loader, grab this file, to know both what files are available, and also, what versions we can get. 

The module loader then makes requests for the latest version ( unless another version is specified ).

This versions file also has a version which is updated whenever any of the versions of the files it lists are updated. 

However, versions is not a static handler. 

What happens is that every time the application is redeployed, it performs the version check task, which basically just reads the codebase/js directory, and for each subdirectory, gets the largest version of each file, and in this way the versions file is computed on instance startup. 

The current versions file is retrieved from the datastore, and if any of the versions it lists are different to the one before, it updates the version of the versions file, it writes the new versions file to the datastore.

Then the final question is, how do we get the latest verion of the versions file in order to obtain the latest versions file, so we can use the latest versions of any modules we use ?

`https://media.dosaygo.com/versions/latest-version.json`

This is a non static end point. It retrieves the versions version number record from the datastore and returns it in json format. 

This can then be used to obtain the latest versions file, which is used to obtain the latest versions of all the modules.

However, this capability of the modules loader is not something which is included in the initial version of the modules loader. 



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

## todo

- log constructors ( wrap, or construct trap )
- log lines ( self.log = Log( <stuff to log>, ...<log scopes> ) , global setter, scobable )
    - ( new Error().stack.split( '\n' )
- log events ( listeners )
- log methods ( proxy traps, wrappers )
- log properties ( proxy traps )




