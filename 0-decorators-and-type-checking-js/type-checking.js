"use strict";
{
  /* inspired by prototype, added support for arrows */
  // TODO 
    // TODO: support spread operator 
    // TODO: support unnamed arguments ( so type by number, like )
    // XMLHttpRequest ${{ 0 : String, 1 : String, 2 : Bool }} 
    // Support optional
    // Support functions not in classes
    // Support type coercion
    // Basically support all kinds of type checking outside of function
    // Support polymorphism
    // Support decorator function definition in the one line.

  function argumentNames(f) {
    const names = f.toString().match(/^[\s\(]*(?:function)?[^(]*\(([^)]*)\)|\s*\(?\s*([^=]+)\s*\)?=>/).slice(1).filter( n => n )[0]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/[\s\(\)\.]+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }  

  self.argumentNames = argumentNames;
  // strict mode requires that all parameters given in a method signature
  // have their types specified

  const STRICT_TYPE_MODE = true;

  function type_string( val ) {
    return Object.prototype.toString.call(val).replace(/^\[object /,'').replace(/\]$/,'');
  }
 
  function make_signature( name, pairs, return_type ) {
    return `${ name }( ${ pairs.map( p=> p[0] + ' : ' + p[1].name ).join( ', ' ) } ) -> ${ return_type.name }`;
  }

  function check_type( val, type ) {
    if( val instanceof type ) return true;
    else if ( typeof( val )  == type ) return true;
    else if ( type_string( val ) == type.name ) return true;
    else {
      try {
        if( type_string( val ) == type_string( new type() ) ) return true;
      } catch ( e ) {
        // type can't be constructed like that
      }
      try {
        if( type_string( val ) == type_string( type() ) ) return true
      } catch ( e ) {
        // type can't be consturcted like that either
      }
    }
    return false;
  }
  
  function type_decorator( fun, args ) {
    console.log( `Function : `, fun );
    console.log( `Function name : ${ args.strings[ 0 ].trim() }` );
    console.log( `Parameters Type signature : `, args.values[ 0 ]);
    console.log( `Return Type signature : `, args.values[ 1 ]);
    const
      arg_types = args.values[ 0 ],
      typed_args = Object.keys( arg_types ),
      arg_order = args[ Symbol.for( `__order__` ) ] || argumentNames( fun );
    if ( typed_args.length > 1 && ( !arg_order || arg_order.length == 0 ) ) 
      throw new TypeError( `method signature has unresolvable type because no ordering of parameters is provided.` );
    if( typeof( arg_order ) == "string" ) arg_order = arg_order.split( /[,\s]+/g );
    const ordered_type_pairs = arg_order.map( n => {
      if( n in arg_types ) return [ n, arg_types[ n ] ];
      else if ( STRICT_TYPE_MODE ) throw new TypeError( `method signature has unresolvable type because the type of argument ${ n } has not been specified` );
    } ),
      signature = make_signature( args.strings[ 0 ].trim(), ordered_type_pairs, args.values[ 1 ] );
    // now check that each argument is of the correct type
    function wrapper() {
      // first obtain the parameters from the function signature, to get their order
      // if there are no parameters in the signature
      // check for an __order__ slot in the type signature which is a string listing their order
      // if neither of these is present and there are more than 1 parameters for the function
      // throw a TypeError( `method signature has unresolvable type becuase no ordering of parmaters is provided` );
      if ( arguments.length < arg_order.length ) 
        throw new TypeError( `Not enough arguments` );
      else if ( arguments.length > arg_order.length ) 
        throw new TypeError( `Too many arguments` );
      Array.from( arguments ).forEach( ( a, i ) => {
        const type_pair = ordered_type_pairs[ i ];
        if( check_type( a, type_pair[ 1 ] ) ) return true;
        else throw new TypeError( `Argument ${ type_pair[ 0 ] } is ${ a } which is not type ${ type_pair[ 1 ].name }` );
      } );
      const results = fun( ...arguments );
      if( check_type( results, args.values[ 1 ] ) ) return results;
      else throw new TypeError( `Return value ${ results } is not of type ${ args.values[ 1 ].name }` );
    }
    wrapper.signature = signature;
    return wrapper;
  }

  const T = decorate( type_decorator ); 

  self.T = T;
  self._ = T;
  self.def = T;
}
