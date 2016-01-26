{
  // Object.values and Object.entries patches
  // some patches for ES7 features that are currently ( 24-Jan-2016 ) patched and 
  // have not yet landed in Chrome
  Object.values = Object.values ||
    function( obj ) {
      return Object.keys( obj ).map( k => obj[ k ] );
    };

  Object.entries = Object.entries ||
    function( obj ) {
      return Object.keys( obj ).map( k => [ k, obj[ k ] ] );
    };
}
{
  // export the main function onto every Element

    Object.defineProperty( 
      Element.prototype,
      'main',
      { get : () => main }
    );		

  // helper functions 

    function all( str ) {
      return Array.from( document.querySelectorAll( str ) );
    }

    function always_true() { return true }

    function attribute_name_to_argument_name( attribute_name ) {
      return attribute_name.split( ATTRIBUTE_PREFIX ).slice(-1)[0].replace( /-/, '_' );
    }
    
    function bind_data_to_node( data, node ) {
      Array.from( node.attributes )
        .map( a => ( { name : a.name, value : a.value } ) )
        .filter( 
          a => BIND_PREFIXES.some( p => a.name.startsWith( p ) ) 
        )
        .forEach( a => create_binding( data, node, a ) );

    }

    function bind_data_to_tree( data, root_node ) {
      const node_walk = walk( root_node );

      for( let step of node_walk ) bind_data_to_node( data, step ); 

      return root_node;
    }

    function bind_text( value, node, text_operation ) {
      switch( text_operation ) {
        case 'replace':
          node.innerText = value; break;
        case 'afterbegin': case 'beforeend':
          node.insertAdjacentText( text_operation, value ); break;
        case 'default':
          console.warn( `Unknown text operation ${ text_operation } ${ value } ${ node }` );
      }
    }
    
    function blank_map() {
      return Object.create( null );
    }

    function create_binding( data, node, bind_request_attribute ) {
      if( bind_request_attribute.name.startsWith( DATA_BIND_ROUTES.ATTRIBUTE_BIND ) ) {
        const target_attribute = bind_request_attribute.name.replace( DATA_BIND_ROUTES.ATTRIBUTE_BIND, '' );
        node.setAttribute( target_attribute, resolve_path( data, bind_request_attribute.value ) );
      } else if ( bind_request_attribute.name.startsWith( DATA_BIND_ROUTES.TEXT_BIND ) ) {
        const text_operation = bind_request_attribute.name.replace( DATA_BIND_ROUTES.TEXT_BIND, '' ),
          value = resolve_path( data, bind_request_attribute.value );
        bind_text( value, node, text_operation );
      }
    }
    
    function defaults_to( default_value ) {
      return function or_default( test_value ) {
        if( unset( test_value ) ) return default_value;
        return test_value;
      }
    }

    function do_something_with_data( data, arg_space ) {
      const bound_node = bind_data_to_tree( data, arg_space.bind_root[ 0 ].cloneNode( true ) ),
        insert_node = arg_space.ins_at[ 0 ];
     
      insert_node.insertAdjacentHTML( arg_space.ins_meth, bound_node.outerHTML );
    }

    function get_raw_value( route, el, override ) {
      const 
        overridden_value = override[ argument_routes[ route ] ],
        attribute_value = el.getAttribute( ATTRIBUTE_PREFIX + attribute_routes[ route ] );

      if( ! unset( overridden_value ) ) return overridden_value;

      return attribute_value;
    }

    function get_parsed_value( route, raw_value ) {
      try { 
        return parse_value[ route ] ? 
          parse_value[ route ] ( raw_value )
          : raw_value;
      } catch ( e ) {
        throw new TypeError( `Invalid/${ route }/${ raw_value }` );
      }
    }

    function json( str ) {
      if ( unset( str ) ) return str;
      return JSON.stringify( JSON.parse( str ) );
    } 

    function json_replacer( key, value ) {
      if( Array.isArray( value ) ) {
        return value.map( v => {
            if( v instanceof Element ) return v + '';
            else if ( v instanceof Function ) return ( v + '' ).slice(0,32); 
            else return v;
          } );
      } else return value;
    }

    function make_arg_space( el, override ) {
      return Object.keys( argument_routes )
          .reduce( ( d, r ) => {
            d[ argument_routes[ r ] ] = 
              validate( r, el, override );
            return d;
        }, blank_map() );
    }

    function optional( value ) {
      return always_true();
    }

    function required( value ) {
      return ! unset( value );
    }

    function required_items( value ) {
      if( Array.isArray( value ) ) {
        return value.length > 0;
      } else return required( value );  
    }

    function resolve_path( obj, slot_path ) {
      const slot_steps = slot_path.split( '.' );
      
      let value = obj;

      while( value && slot_steps.length > 0 ) {
        value = value[ slot_steps.shift() ];
      }

      return value;
    }

    function string_parse( raw ) {
      if( unset( raw ) ) return raw;
      return raw.trim();
    }
  
    function test_value( route, value ) {
      return allow_value[ route ] ? 
        allow_value[ route ]( value )
        : true
    }

    function unset( value ) {
      return value === null || value === undefined;
    }

    function uri( str ) {
      return new URL( str ).toString();
    }
    
    function validate( route, el, override ) {
      const 
        raw_value = get_raw_value( route, el, override ), 
        value = get_parsed_value( route, raw_value ), 
        value_test = test_value( route, value ); 

      if( value_test ) return value;

      throw new TypeError( `Invalid/${route}/${value}/${ allow_value[ route ].name }` ); 
    }

    function *walk( node, show = NodeFilter.SHOW_ELEMENT ) {
      const walker = node.ownerDocument.createTreeWalker( node, show );
      while( walker.nextNode() ) yield walker.currentNode;
    }

  // helper data 

    const 
      
      ATTRIBUTE_PREFIX = 'usfe-',

      DATA_BIND_ROUTES = {

        ATTRIBUTE_BIND            : ATTRIBUTE_PREFIX + 'bind-attr-',

        TEXT_BIND                 : ATTRIBUTE_PREFIX + 'bind-text-'

      },

      BIND_PREFIXES = Object.values( DATA_BIND_ROUTES ),

      attribute_routes = {
          MODIFY_METHOD           : 'mod-meth',
          MODIFY_SELECTOR         : 'mod-at',
          REQUEST_URI             : 'req-uri',
          REQUEST_METHOD          : 'req-meth',
          REQUEST_PAYLOAD         : 'req-body',
          DATA_BIND_ROOT_SELECTOR : 'bind-root',
          INSERT_METHOD           : 'ins-meth',
          INSERT_SELECTOR         : 'ins-at'
        },  

      argument_routes = Object.keys( attribute_routes )
        .reduce( ( d, k ) => { 
            d[ k ] = attribute_name_to_argument_name( attribute_routes[ k ] );
            return d;
          }, 
          blank_map() 
        );

      parse_value = {
          MODIFY_METHOD           : string_parse, 
          MODIFY_SELECTOR         : all, 
          REQUEST_URI             : uri, 
          REQUEST_METHOD          : defaults_to( 'get' ), 
          REQUEST_PAYLOAD         : json, 
          DATA_BIND_ROOT_SELECTOR : all, 
          INSERT_METHOD           : defaults_to( 'afterbegin' ), 
          INSERT_SELECTOR         : all 
        }, 

      allow_value = {
          MODIFY_METHOD           : optional,   
          MODIFY_SELECTOR         : optional,  
          REQUEST_URI             : required,  
          REQUEST_METHOD          : required,  
          REQUEST_PAYLOAD         : optional,  
          DATA_BIND_ROOT_SELECTOR : required_items,  
          INSERT_METHOD           : required,  
          INSERT_SELECTOR         : required_items
        };

  // main function 

    function main( override = blank_map() ) {
      const arg_space = make_arg_space( this, override ),
        request_configuration = {
          method : arg_space.req_meth,
          body : arg_space.req_body
        },
        exchange = fetch( arg_space.req_uri, request_configuration );

      exchange.then( response => 
        response.json().then( data => 
          do_something_with_data( data, arg_space ) 
        ) 
      );

      console.log( `arg_space : ${ JSON.stringify( arg_space, json_replacer ) }` );
    }
}
