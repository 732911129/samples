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
        .map( a => parse_binding( a ) )
        .forEach( ( [ bind_type, bind_detail, path ] ) =>
          create_binding( node, bind_type, bind_detail, path, data ) 
        );
    }
    
    function bind_data_to_tree( data, root_node ) {
      const node_walk = walk( root_node );

      for( let step of node_walk ) bind_data_to_node( data, step ); 

      return root_node;
    }
    
    function bind_attribute( node, bind_detail, path, data ) {
      node.setAttribute( bind_detail, resolve_path( path, data ) );
    }

    function bind_text( node, bind_detail, path, data ) {
      const value = resolve_path( path, data );
      switch( bind_detail ) {
        case 'replace':
          node.innerText = value; break;
        case 'beforebegin' : case 'afterbegin': 
        case 'beforeend': case 'afterend':
          node.insertAdjacentText( bind_detail, value ); break;
        default:
          console.warn( `Unknown text bind location ${ bind_detail }, with ${ value } ${ node }` );
      }
    }
    
    function blank_map() {
      return Object.create( null );
    }
    
    function child_nodes_frag( container ) {
      const child_nodes = Array.from( container.childNodes ),
        frag = document.createDocumentFragment();
      return child_nodes.reduce( ( d, node ) => ( d.appendChild( node.cloneNode( true ) ), d ), frag );
    }

    function css_selector_escape( unescaped_selector ) {
      const escapables = ":.",
        matcher = new RegExp( `([${escapables}])`, 'g' );
      return [ matcher, unescaped_selector.replace( matcher, '\\\\$1' ) ];
    }

    function create_binding( node, bind_type, bind_detail, path, data ) {
      switch( bind_type ) {
        case DATA_BIND_ROUTES.ATTRIBUTE_BIND_PREFIX:
          bind_attribute( node, bind_detail, path, data ); break;
        case DATA_BIND_ROUTES.TEXT_BIND_PREFIX:
          bind_text( node, bind_detail, path, data ); break;
        default:
          throw new TypeError( `Bind type ${ bind_type } is not a data bind prefix.` ); 
      }
    }
    
    function defaults_to( default_value ) {
      return function or_default( test_value ) {
        if( unset( test_value ) ) return default_value;
        return test_value;
      }
    }

    function do_something_with_data( data, arg_space ) {
      // FIXME : this is only binding the first root, to the first insert point
      // what if multiple elements are returned by the selectors?
      // what's the logic then?
      const bound_tree = bind_data_to_tree( data, child_nodes_frag( arg_space[ argument_routes.DATA_BIND_ROOT_SELECTOR ][ 0 ] ) ),
        insert_node = arg_space[ argument_routes.INSERT_SELECTOR ][ 0 ];
     
      insert_node.insertAdjacentHTML( arg_space.ins_meth, node_to_html( bound_tree ) );
    }

    function frag_to_html( frag ) {
      return Array.from( frag.childNodes )
        .map( n => n.outerHTML )
        .join( '' );
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

    function node_to_html( node ) {
      if( node instanceof DocumentFragment ||
        node instanceof Document ) return frag_to_html( node )
      else if ( node instanceof Element ) return node.outerHTML;
      else if ( node instanceof Text ) return node.textContent;
      else throw new TypeError( `Node ${ node } is not a node type that can become HTML` );
    }

    function optional( value ) {
      return always_true();
    }
    
    function parse_binding( bind_request_attribute ) {
      const [ has_prefix, bind_type, bind_detail ] = remove_prefix( bind_request_attribute.name, BIND_PREFIXES ),
          path = bind_request_attribute.value;
      if( ! has_prefix ) throw TypeError( `Attribute ${ bind_request_attribute } is not a bind request attribute.` );
      return [ bind_type, bind_detail, path ];
    }
    
    function remove_prefix( word, prefixes ) {
      let prefix = '';
      const has_prefix = prefixes.some( p => word.startsWith( p ) ? ( prefix = p, true ) : false ),
        suffix = word.slice( prefix.length );
      return [ has_prefix, prefix, suffix ]; 
    }
   
    function required( value ) {
      return ! unset( value );
    }

    function required_items( value ) {
      if( Array.isArray( value ) ) {
        return value.length > 0;
      } else return required( value );  
    }

    function resolve_path( path, data ) {
      try { 
        const keys = path.split( '.' );
        
        let value = data;

        while( value && keys.length > 0 ) {
          value = value[ keys.shift() ];
        }

        return value;
      } catch ( e ) {
        console.log( data, path );
        console.warn( TypeError( `${ data } ${ path } caused an error in ${ resolve_path }` ) );
      }
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
      
      ATTRIBUTE_PREFIX = ':-',

      DATA_BIND_ROUTES = {
        ATTRIBUTE_BIND_PREFIX   : ATTRIBUTE_PREFIX + 'a-',
        TEXT_BIND_PREFIX        : ATTRIBUTE_PREFIX + 't-'
      },

      BIND_PREFIXES = Object.values( DATA_BIND_ROUTES ),

      attribute_routes = {
          MODIFY_METHOD           : 'mod-meth',
          MODIFY_SELECTOR         : 'mod-at',
          REQUEST_URI             : 'req-uri',
          REQUEST_METHOD          : 'req-meth',
          REQUEST_PAYLOAD         : 'req-body',
          DATA_BIND_ROOT_SELECTOR : 'bind-at',
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
