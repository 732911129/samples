// wrapped in an IIFE for ease of pasting
( function () { 
  "use strict";
 
  // script events block
  {
  // install script events 
    const $ = Symbol( '[ Private Listener Store Endpoint ]' ),
      $$ = Symbol( '[ Private Listener Store ]' ),
      $$$ = Symbol.for( '[ Script Events Installed ]' );

    if( ! self.hasOwnProperty( $$$ ) ) { 

      Object.defineProperty( self, $$$, { get : () => $$$ } );
      
      try { 
        // extend HTMLElement to have the event properties 
        Object.defineProperties( HTMLElement.prototype, {
            [ $ ] : {
              get() {
                if( ! this.hasOwnProperty( $$ ) ) {
                  const private_store = { beforelistener : null, afterlistener : null };
                  Object.defineProperty( this, $$, { get : () => private_store } ); 
                }          
                return this[ $$ ];
              }
            }, 
            onbeforescriptexecute : { 
              get() { return this[ $ ].beforelistener },
              set( listener ) {
                if( ! this[ $ ].beforelistener ) { 
                  this.addEventListener( 'beforescriptexecute', listener );
                  this[ $ ].beforelistener = listener;
                }
              }
            },
            onafterscriptexecute : {
              get() { return this[ $ ].afterlistener },
              set( listener ) {
                if( ! this[ $ ].afterlistener ) { 
                  this.addEventListener( 'afterscriptexecute', listener );
                  this[ $ ].afterlistener = listener;
                }
              }
            }
          } );
      } catch ( e ) {
        console.info( e );
      }

      self.reload_with_scriptevents = reload_with_scriptevents;

    }

  // helpers 
    function bracket_script( script_tag ) {
      const bside = `<script>(${ before })();</script>`,
        aside = `<script>(${ after })();</script>`;
      
      script_tag.insertAdjacentHTML( 'beforebegin', bside );
      script_tag.insertAdjacentHTML( 'afterend', aside );
        
      function before() {
        const will = new CustomEvent( 'beforescriptexecute', { bubbles : true, cancelable : true, detail : { 
            will_run : document.currentScript.nextElementSibling } } 
          );
        const cancel = ! document.currentScript.nextElementSibling.dispatchEvent( will );
        if( cancel ) document.currentScript.nextElementSibling.setAttribute( 'wont-run', '' );
      }
      function after() {
        const did = new CustomEvent( 'afterscriptexecute', { bubbles : true, detail : { 
            did_run : document.currentScript.previousElementSibling } } 
          );
        document.currentScript.previousElementSibling.dispatchEvent( did );
      }
      return [ script_tag.previousElementSibling, script_tag.nextElementSibling ];
    }

    function unbracket_script( script_tag ) {
      script_tag.previousElementSibling.remove();
      script_tag.nextElementSibling.remove();
    }
    
    function activate_script( script_tag ) {
      if( ! script_tag.hasAttribute( 'wont-run' ) ) {
        const activating_script = document.createElement( 'script' );
        if ( script_tag.text ) activating_script.appendChild( document.createTextNode( script_tag.text ) );
        else if ( script_tag.src ) activating_script.setAttribute( 'src', script_tag.src );
        else {} // nothing to activat 
        script_tag.parentNode.replaceChild( activating_script, script_tag );
        return activating_script;
      } else {
        script_tag.removeAttribute( 'wont-run' );
        return script_tag;
      }
    }
    
    function parse_scripts_with_script_events() {
      function *fake_parser( all_scripts ) {
        const to_browser = () => setTimeout( _ => parser.next(), BREATHER );
        all_scripts = Array.from( all_scripts );
        while( all_scripts.length ) {
          let next_script = all_scripts.shift();
           
          const [ before, after ] = bracket_script( next_script );
         
          activate_script( before );
          yield to_browser();
          next_script = activate_script( next_script );
          yield to_browser();
          activate_script( after );
          yield to_browser();
          
          unbracket_script( next_script );
        }
      }
      
      const BREATHER = 100, // ms
        parser = fake_parser( document.querySelectorAll( 'script' ) );  
      
      parser.next();
    }
    
    function reset_page( configuration = { 'reset_type' : 'innerHTML' }, subsequent = () => {} ) {
      switch( configuration.reset_type ) {
        case 'innerHTML':
          const page_body = document.documentElement.innerHTML;
          document.documentElement.innerHTML = page_body;
          return subsequent();
        case 'GET':
        case 'POST':
          const exchange = new XMLHttpRequest();
          exchange.responseType = 'document';
          exchange.open( configuration.reset_type, self.location.href );
          exchange.addEventListener( after_completion( subsequent ) );
          return exchange.send( configuration.request_body );
        default:
          throw new ValueError( `${ configuration.reset_type } is not one of innerHTML, GET or POST.` );
      }
      
      function after_completion( task ) {
        return task_runner;
        function task_runner( readystatechange ) {
          if( readystatechange.target.readyState == 4 ) { // it doesn't matter what the status is, we will do it anyway
            document.replaceChild( readystatechange.target.response, document.documentElement );
            task();
          }
        }
      }
    }
    
    function reload_with_scriptevents( configuration ) {
      reset_page( configuration, parse_scripts_with_script_events );
    }
  } 
  
} () );
