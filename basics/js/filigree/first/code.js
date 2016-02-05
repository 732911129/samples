"use strict";

self.loader.filigree = (function*(){
    {
        // requirements 
        yield '';
        
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
            function request_decoration( strings, ...values ) {
              const decorated_name = strings[ 0 ].trim(),
                args = { strings, values },
                decoration_request = { decorated_name, decorator, args };
              if ( !( decorated_name in decorator_map ) ) decorator_map[ decorated_name ] = [];
              decorator_map[ decorated_name ].push( decoration_request );
              return Symbol.for( `[[ decoration ]]` );
            }
            return request_decoration;
          }
    
          // we can pass args to the decorator method
          // these can be used however the decorator method decides
          // the args are passed in the decoration line
          // like so :
          // [ dec`fun ${ arg1 } ${ arg2 } ${ arg3 }` ](){}
          // and the args are actually an object of format { strings, values }
          // so to access arg1 we write args.values[ 0 ]
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
                  decoration_requests.forEach( req => method = wrap( req.decorator, method, req.args ) );
                  decorator_map[ fun_name ] = []; // delete decorators
                  proto[ fun_name ] = method;
                } else console.warn ( `${ proto } has no method ${ fun_name }` );
              }
            }
          }
    
        
      self.decorate = decorate;
      self.apply_decorators = apply_decorators;
      
      // exports
      yield { decorate, apply_decorators };
    }
}());
