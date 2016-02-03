"use strict";
{
  // TODO 
    // DONE 
      // DONE correct type check for generator
      // DONE clean up code 
      // DONE implement new syntaxes for arg order
      // NO replace argument regex with a small FSM implemented with coroutines.
      //  [ CONTRIBUTING REASON : with default parameters argument list strings can contain expressions ]
      // DONE support unnamed arguments ( so type by number, like )
      // DONE Support polymorphism
      // DONE rewrite documentation
      // DONE factor out multiline functions into other blocks 
      // DONE factor out multiline functions into other blocks 
    // refactor code
      // refactor error logic in polymorphic type wrapper 
    // new syntaxes
    // support static methods
    // support setters 
    // support functions not in classes
    // support function as parameter type signature specification

  // constants related to type checking 

    // the map where all type decorations are stored before they are applied

    const 
      type_decorator_map = Object.create( null ),
      type_decorated_names_queue = [],
      name_type_labeling = { key : 'name', value : 'type' };
  
    // declared types for builtins the types of which aren't otherwise inspectable 

      // generator type

        {
          self.Generator = (function*(){}()).constructor.prototype;
        }

  // classes 

    // class related constants

      const $ = Symbol( `[[ Private ]]` );

    // a super class for error details 

      class Stringable {
        
        constructor( string ) {
          Object.defineProperty( this, $, { get : () => string } );
        }
        
        static get ITEM_SEPARATOR() {
          return ' \t&&\t ';
        }
        
        static combineList( list ) {

          if( ! list.every( item => item instanceof Stringable ) )
            throw new TypeError( `Some items in the list are not of type Stringable.` );
          
          return list.
            map( item => item.toString() ).
            join( this.ITEM_SEPARATOR );
        }
   
        get [ Symbol.toStringTag ]() {
          return this.constructor.name;
        }
        
        toString() {
          return this[ $ ];
        }
        
      }

    // type classes 

      class TypeSignatureError extends Stringable {
        
        static ReturnTypeMismatch( sig, ret_val ) {
          return new this( 
              `Return Type Mismatch Error: r eturn type is declared ${ 
                type_name( sig.return_type ) 
              }, and function ${ 
                sig.name 
              } returned value ${ 
                ret_val 
              } of type ${ 
                value_type( ret_val ) 
              }.` 
            );
        }
        
        static ArgumentTypeMismatch( sig, arg_index, declared, val ) {
          return new this(
              `Argument Type Mismatch Error : sig : ${ 
                sig.toString() 
              } : Argument at index ${ 
                arg_index 
              }, named ${ 
                declared.name 
              }, is declared type ${ 
                type_name( declared.type ) 
              }, and was passed value <${ 
                val 
              }> of type ${ 
                value_type( val ) 
              }.` 
            );
        }
        
        static ArgumentNumberMismatch( sig, arg_vals ) {
          return new this(
              `Argument Number Mismatch Error : signature : ${ 
                  sig.toString() 
                } : Incorrect number of arguments. Expects ${ 
                  sig.arity 
                }, given ${ 
                  arg_vals.length 
                }` 
            );
        }

      }

      class TypeSignature {
        
        constructor( type_metadata ) {
          Object.assign( this, type_metadata );
        }
        
        static fromTypeString( strings, ...values ) {
          return new this( parse_type_metadata( strings, ...values ) );
        }
        
        get [ Symbol.toString ] () {
          return this.toString();
        }
        
        get [ Symbol.toStringTag ] () {
          return this.constructor.name;
        }
        
        argumentTypesToString() {
          return this.type_defs
            .map( 
                p => `${ p.name } : ${ type_name( p.type ) }`  
              )
            .join(', ');
        }
       
        toString() {
          return `${ 
              this.name 
            }( ${ 
              this.argumentTypesToString() 
            } ) -> ${ 
              type_name( this.return_type ) 
            }`;
        }
    
        validate_arguments( args, invalids ) {
          const 
            arg_values = Array.from( args );

          if( arg_values.length !== this.arity ) {
            invalids.push( TypeSignatureError.ArgumentNumberMismatch( this, arg_values ) ); 
            return invalids;
          }

          arg_values.
            map( 
                ( arg_val, arg_index ) => validate_argument( this, arg_val, arg_index, invalids ) 
              );

          return invalids;
        }
        
        validate_return( return_value, invalids ) {

          if( ! check_type( return_value, this.return_type ) )
            invalids.push( TypeSignatureError.ReturnTypeMismatch( this, return_value ) ); 

          return invalids;
        }
        
      }
      
     self.TypeSignature = TypeSignature;

    // polymorphic type classes

      // polymorphic type error class

        class PolymorphicTypeError extends Stringable {
          
          static NoMatchingSignature( name, arg_vals ) {
            return new this(
                `No Matching Signature Error : No functions named ${ 
                  name 
                } could be found matching signature ${
                  arg_vals.
                    map( 
                        val => value_type( val ) 
                      ).
                    join( ', ' ) 
                 }. Specific mismatches follow.` 
              );
          }
          
          static TooManyMatchingSignatures( name, arg_vals ) {
            const
              arg_signature = arg_vals.map( val => value_type( val ) ).join( ', ' );
            return new this(
                `Too Many Matching Signatures Error : Too many functions named ${ 
                  name 
                } were found matching signature ${
                  arg_signature
                }.` 
              );
          }
          
        }

  // helpers 

    // general helpers 

      function append( list, ...items ) {
        list.push( ...items );
        return list;
      }

      function append_at_key( key, map, value ) {
        let list = map[ key ];

        if ( ! list ) list = map[ key ] = [];

        return append( list, value );
      }

      function blank() {
        return Object.create( null );
      }

      function flatten_map_of_lists( map ) {
        return Object.
          keys( map ).
          reduce( 
              ( all, key ) => append( all, ...map[ key ] ),
              [] 
            );
      }

      function add_if_absent( value, list ) {
        if( ! list.includes( value ) )
          list.push( value );
        return list;
      }

      function set( map, ...flat_entries ) {
        for( let i = 0; i < flat_entries.length - 1; i+=2 )
          map[ flat_entries[ i ] ] = flat_entries[ i + 1 ]; 
        return map;
      }

      function map_by_keys_length_error( keys, values ) {
        return new ValueError( 
            `Keys and values work to be of equal length. Keys has ${ 
              keys.length 
            } items, values has ${ 
              values.length 
            } items.` 
          );
      }

      function map_by_keys( keys, values ) {

        if( keys.length !== values.length ) 
          throw map_by_keys_length_error( keys, value );

        return keys.reduce( 
            ( map, key, index ) => set( map, key, values[ index ] ),
            {} 
          );
      }

      // enumerate_mapping( map : Dictionary, format : KeyValueMap ) -> List<KeyValueMap>
 
      function relabel_entry( key, map, labeling ) {
        return Object.assign( blank(), 
            {
              [ labeling.key    ] : key,
              [ labeling.value  ] : map[ key ]
            }
          )
      }

      function relabel_entries( map, labeling ) {
        return Object.
          keys( map ).
          reduce( 
              ( relabeled, key ) => append( relabeled, relabel_entry( key, map, labeling ) ),
              []
            );
      }

    // type helpers 
      
      function check_type( val, type ) {
        try {
          if( val instanceof type ) return true;
        } catch( e ) { 
          //console.warn( `Warning ${ type } is not a function.`, type ); 
          // checking against value_type of type is necessary for Generator
          try {
            if( value_type( val ) == value_type( type ) ) return true;
          } catch( e ) {}
        }
        if ( typeof( val )  == type ) return true;
        else if ( value_type( val ) == type.name ) return true;
        else return false;
      }

      function parse_type_metadata ( strings, ...values ) {
        const 
          name = strings[ 0 ].trim(),
          return_type = values.pop(),
          type_defs = values.map( def => relabel_entries( def, name_type_labeling )[ 0 ] ),
          argument_order = type_defs.map( type_def => type_def.name ),
          argument_types = map_by_keys( argument_order, type_defs ),
          arity = argument_order.length,
          metadata_slots = {
              name, 
              arity, 
              type_defs,
              argument_types,
              return_type
            },
          type_metadata = Object.assign( blank(), metadata_slots );
        return type_metadata;
      }
   
      function type_name( type ) {
        return type.name || value_type( type );
      }

      function validate_argument( signature, val, arg_index, invalids ) {
        const 
          declared = signature.type_defs[ arg_index ],
          result = check_type( val, declared.type );
        if( result ) return true;
        else invalids.push( 
            TypeSignatureError.ArgumentTypeMismatch( signature, arg_index, declared, val ) 
          );
        return false;
      }
    
      function value_type( val ) {
        return Object.prototype.toString.call( val ).
          replace( /^\[object /, '' ).
          replace( /\]$/, '' );
      }

    // polymorphic type helpers

      function check_candidate_is_alone( candidate_morphisms, name, arg_vals, type_errors_by_signature ) {
        const polymorphic_type_errors = [];

        if ( candidate_morphisms.length == 0 ) {
          polymorphic_type_errors.push( 
              PolymorphicTypeError.NoMatchingSignature( name, arg_vals ),
              ...flatten_map_of_lists( type_errors_by_signature ) 
            );
        } else if ( candidate_morphisms.length > 1 ) {
          polymorphic_type_errors.push( 
            PolymorphicTypeError.TooManyMatchingSignatures( name, arg_vals ) );
        } 

        return polymorphic_type_errors;
      }

      function find_candidate_morphisms( args, morphisms, type_errors_by_signature ) {
        const candidate_morphisms = [];

        for( const { signature, method } of morphisms ) {
          const 
            type_errors = type_errors_by_signature[ signature ] = [];
          signature.validate_arguments( args, type_errors );
          if( type_errors.length == 0 )
            candidate_morphisms.push( { signature, method } );
        }

        return candidate_morphisms;
      }

      function label_request( req, name, number ) {
        req.label = make_polymorphic_name_symbol( name, number );

        return req.label;
      }

      function make_polymorphic_name_symbol( name, index ) {
        return Symbol.for( 
            `[[ ${ 
              name 
            } morphism ${ 
              index 
            } ]]` 
          );
      }
      
      function run_chosen_morphism( chosen_morphism, arg_vals, scope_this, polymorphic_type_errors ) {
        const 
          return_value = chosen_morphism.method.call( scope_this, ...arg_vals );

        chosen_morphism.signature.validate_return( return_value, polymorphic_type_errors );
        
        return return_value;
      }

      function save_new_morphism( morphisms, type, req ) {
        const 
          method = type.prototype[ req.label ],
          signature = new TypeSignature( req.type_metadata );
        morphisms.push( { method, signature } );
      }

  
  // main polymorphic decoration functions

    function apply_polymorphic_decorators( type ) {
      while( type_decorated_names_queue.length ) {
        const 
          name = type_decorated_names_queue.pop(),
          decoration_requests = type_decorator_map[ name ],
          morphisms = [];

        decoration_requests.forEach( req => save_new_morphism( morphisms, type, req ) );
        
        type.prototype[ name ] = polymorphic_type_decorator( { name, morphisms } );
        
        type_decorator_map[ name ] = [];
      }
    }

    function polymorphic_decorate( decorator ) {
      function request_decoration( strings, ...values ) {
        const 
          type_metadata = parse_type_metadata( strings, ...values ),
          name = type_metadata.name,
          decoration_request = { name, type_metadata },
          decoration_requests = append_at_key( name, type_decorator_map, decoration_request );

        add_if_absent( name, type_decorated_names_queue );

        return label_request( decoration_request, name, decoration_requests.length );
      }
      return request_decoration;
    }

    function polymorphic_type_decorator( args ) {
      function wrapper() {
        const 
          { name, morphisms } = args,
          arg_vals = Array.from( arguments ),
          type_errors_by_signature = {},
          candidate_morphisms = 
            find_candidate_morphisms( arg_vals, morphisms, type_errors_by_signature ),
          polymorphic_type_errors = 
            check_candidate_is_alone( candidate_morphisms, name, arg_vals, type_errors_by_signature );

        if ( polymorphic_type_errors.length )
          throw new TypeError( Stringable.combineList( polymorphic_type_errors ) );

        const return_value = run_chosen_morphism( candidate_morphisms.pop(), arg_vals, this, polymorphic_type_errors );

        if ( polymorphic_type_errors.length )  
          throw new TypeError( Stringable.combineList( polymorphic_type_errors ) );
        
        return return_value;
      }
      wrapper.morphisms = args.morphisms;
      return wrapper;
    }

  // export 
    // T
    // Type

      const 
        T = 
          self.T =
            polymorphic_decorate( polymorphic_type_decorator ); 
        Type = 
          self.Type =
            apply_polymorphic_decorators;

}
