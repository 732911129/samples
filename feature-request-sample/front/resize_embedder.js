"use strict";
// this script reizes the embedding embed tag to fit the dimensions of the embedded content
// doing so on load and also on resize
self.resize_off = false;
  (function () {
    Object.defineProperty( String.prototype, 'subtract', { get : function() { return subtract; } } );

    function subtract( subtractand ) {
      var i = 0;
      while( i < this.length ) {
        if( this[ i ] !== subtractand[ i ] ) break;
        i++;
      }
      return this.slice( i );
    }
  }());
  (function () {
    // the function to resize
    function resize( event, block_resize ) {
      if( ! self.embedding_tag ) {
        var
          parent = self.parent.document,
          embed_candidates = Array.from( parent.querySelectorAll( 'iframe' ) ),
          embed = embed_candidates.filter( function( f ) { return f.contentWindow == self } )[ 0 ]
        self.embedding_tag = embed;
      }
      var
        embed = self.embedding_tag;
      if( embed ) {
        console.log( embed );
        setTimeout( function () {  
          var
            component = document.querySelector( '#component' ),
            doc_style = getComputedStyle( component ),
            embed_style = getComputedStyle( embed ),
            embedder_rect = embed.getBoundingClientRect(),
            client_rect = component.getBoundingClientRect(),
            embedder = { 
                width : Math.round( embedder_rect.width ), 
                height : Math.round( embedder_rect.height ) 
              },
            client = { 
                width : Math.round( client_rect.width ), 
                height : Math.round( client_rect.height ) 
              },
            border = { 
                content : { 
                  width : ( parseInt( doc_style.borderLeftWidth ) || 0 ) + ( parseInt( doc_style.borderRightWidth ) || 0 ),
                  height : ( parseInt( doc_style.borderTopWidth ) || 0 ) + ( parseInt( doc_style.borderBottomWidth ) || 0 )
                }, 
                embed : {
                  width : ( parseInt( embed_style.borderLeftWidth ) || 0 ) + ( parseInt( embed_style.borderRightWidth ) || 0 ),
                  height : ( parseInt( embed_style.borderTopWidth ) || 0 ) + ( parseInt( embed_style.borderBottomWidth ) || 0 )
                }
              },
            scroll = { 
                width : component.scrollWidth + border.content.width, 
                height : component.scrollHeight + border.content.height 
              },
            content = {
                width : client.width,
                height : client.height
              },
            scrollbars = {
              content : {
                vertical : content.height > scroll.height, 
                horizontal : content.width > scroll.width
              }, 
              embedder : {
                vertical : content.height > embedder.height,
                horizontal : content.width > embedder.width
              }
            };

          if( component.hasAttribute( 'ignore-content-dimensions' ) ) {
            return;
          }
          // apply size corrections based on scrollbars 

          console.group( `Resizing Dimensions for ${ location.href }` );
          console.log( `Embedder `, JSON.stringify( embedder ) );
          console.log( `Client `, JSON.stringify( client ) );
          console.log( `Scroll `, JSON.stringify( scroll ) );
          console.log( `Border `, JSON.stringify( border ) );
          console.log( `Content `, JSON.stringify( content ) );
          console.log( `Scrollbars `, JSON.stringify( scrollbars ) );
          console.groupEnd();
          console.log('\n');

          if( ! block_resize && ! self.resize_off ) {
            if( ! component.hasAttribute( 'ignore-content-height' ) )
              embed.style.height = content.height + border.embed.height + "px";
            else
              embed.style.minHeight = 127;
            if( ! component.hasAttribute( 'ignore-content-width' ) )
              embed.style.width = content.width + border.embed.width + "px";
            else
              embed.style.minWidth = 255;
            //embed.style.minHeight = content.height + border.embed.height;
            //embed.style.minWidth = content.width + border.embed.width;
            if( ! embed.classList.contains( 'js-active' ) ) {
              embed.classList.add( 'js-active' );
            }
            emit_resize( embed );
          }
        }, 40 );
      } else throw new TypeError( 'Embedding tag not found! ' );
    }
    self.resize = resize;
    resize();
  }());
  (function () {
    // the function to emit custom resize event
    function emit_resize( target ) {
      var
        e = new CustomEvent( 'component-resize', { bubbles: true } );
      target.dispatchEvent( e ); 
    }
    self.emit_resize = emit_resize;
  }());
  (function () {
    //resize when custom event triggered. 
    document.addEventListener( 'component-resize', resize );
    window.addEventListener( 'load', resize );
    window.addEventListener( 'mouseup', resize );
  }());
  (function () {
    // components that trigger resize 
    var
      resize_triggers = Array.from( document.querySelectorAll( '[resize-triggers]' ) );

    console.log( `Parts with resize triggers `, resize_triggers );

    resize_triggers.forEach( function ( el ) {
        var
          events_to_resize_on = el.getAttribute( 'resize-triggers' ).split( /\s+/g );
        // set timeout is necessary so that redraw can happen before we measure the size 
        events_to_resize_on.forEach( 
          function ( name ) { 
            return el.addEventListener( name, 
              function () { 
                setTimeout( 
                  function () { emit_resize( el ) } , 0 );
              } 
            ) 
          } 
        );
      } 
    );
  }());
  (function () {
    // new ideas : resize negotiation
    var 
      INTERVAL = 50, // 3 frames
      index,
      steps = [
        `
          page gives more or less space to embedded tag ( width, height unset ),
          embedding tag occupies available space ( content in tag reflows ),
          branch(
            if embedded content is too large for space, then embedded tag minimum is set to content dimensions
            if embedded content is too small for space, then embedded tag maximum is set to content dimensions
          )
        `
      ];

    function negotiate_resize() {
      index = 0;
      yield_then_run_next_step();
    }

    function next_step() {
      var 
        current_step = steps[ index ];
      current_step();
      index++;
      yield_then_run_next_step();
    }

    function yield_then_run_next_step() {
      setTimeout( next_step, INTERVAL );
    }
  }());

