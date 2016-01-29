"use strict";
{
    /**
     *
     * a decorator function performs the following steps 
     * 
     * 1. Saves the decoration request in a decorator map.
     * 2. Once an apply decorators call is performed, iterates through each name
     * in the decorator map, finds the function named so in the given type, and wraps
     * them in each decorator, in turn, in the order in which the decoration requests
     * appear in the list keyed by that functions name. 
     */

    // decorator_map
      const decorator_map = Object.create( null );

      function decorate( decorator ) {
         return function capture( strings, ...values ) {
           const decorated_name = strings[ 0 ].trim(),
              args = { strings, values },
            decoration_request = { decorated_name, decorator, args };
          if ( !( decorated_name in decorator_map ) ) decorator_map[ decorated_name ] = [];
          decorator_map[ decorated_name ].push( decoration_request );
          //console.log( 'Saved decoration request', decoration_request );
          return Symbol.for( '[[ Decoration Only ]]' );
        }
      }

      function wrap( decorator, method, args ) {
        return decorator( method, args );  
      }

      function apply_decorators( type ) {
        const proto = type.prototype;
        for( let fun_name of Object.keys( decorator_map ) ) {
          const decoration_requests = Array.from( decorator_map[ fun_name ] );
          decoration_requests.reverse();
          if( decoration_requests.length > 0 ) {
            if( proto[ fun_name ] ) {
              let method = proto[ fun_name ];
              console.log( decoration_requests );
              decoration_requests.forEach( req => method = wrap( req.decorator, method, req.args ) );
              decorator_map[ fun_name ] = []; // delete decorators
              proto[ fun_name ] = method;
            } else console.warn ( `${ proto } has no method ${ fun_name }` );
          }
        }
      }

    // type_map 
      const type_map = Object.create( null );

      function save_type_declaration( strings, ...values ) {
        const name = strings[ 0 ].trim(),
          signature = values[ 0 ],
          return_value = values[ 1 ],
          type_object = { name, signature, return_value };
        if( !( name in type_map ) ) type_map[ name ] = [];
        type_map[ name ].push( type_object );
      }

    function dec1( fun ) {
      //console.log( `Wrapping fun with dec1`, dec1 );
      function wrapper() {
        //console.log( `Applying decoration dec1 to fun`, fun );
        arguments[0] += 10;
        let result = fun( ...arguments );
        result *= 2;
        return result;
      }
      return wrapper;
    }

    function dec2( fun ) {
      //console.log( `Wrapping fun with dec2`, dec2 );
      function wrapper() {
        //console.log( `Applying decoration dec2 to fun`, fun );
        arguments[0] += 20;
        let result = fun( ...arguments );
        result *= 3;
        return result;
      }
      return wrapper;
    }
 
  self.decorate = decorate;
  self.apply_decorators = apply_decorators;
}
