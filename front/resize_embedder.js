"use strict";
// this script reizes the embedding embed tag to fit the dimensions of the embedded content
// doing so on load and also on resize
(function () {
  Object.defineProperty( String.prototype, 'subtract', { get : () => subtract } );

  function subtract( subtractand ) {
    let i = 0;
    while( i < this.length ) {
      if( this[ i ] !== subtractand[ i ] ) break;
      i++;
    }
    return this.slice( i );
  }
}());
(function () {
  function resize( event, block_resize ) {
    const 
      parent = self.parent.document,
      parent_uri = parent.location.href,
      my_uri = self.document.location,
      absolute_src = my_uri.pathname,
      full_src = my_uri.href,
      relative_src = my_uri.href.subtract( parent_uri ),  // string subtraction

                                                          // in the below, the last value
                                                          // the suffix selector $=
                                                          // is a fallback, 
                                                          // it can error ( because there may be 
                                                          // more than 1 embed tags that share the 
                                                          // same suffix yet are different documents
                                                          // tho it can also catch cases not caught
                                                          // by others such as '../'
      embed = parent.querySelector( `
          object[data="${ full_src }"],
          object[data="${ absolute_src }"],
          object[data="${ relative_src }"],
          object[data$="${ relative_src }"]               
        `);
    if( embed ) {
      setTimeout( () => {  
        const
          doc_style = getComputedStyle( document.documentElement ),
          embed_style = getComputedStyle( embed ),
          embedder_rect = embed.getBoundingClientRect(),
          client_rect = document.documentElement.getBoundingClientRect(),
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
              width : document.documentElement.scrollWidth + border.content.width, 
              height : document.documentElement.scrollHeight + border.content.height 
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

        if( ! block_resize ) {
          embed.height = content.height + border.embed.height;
          embed.width = content.width + border.embed.width;
        }
      }, 500 );
    }
  }
  resize();
  self.resize = resize;
}());
(function () {
  function emit_resize( target ) {
    const
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
  //window.addEventListener( 'resize', resize );
}());
(function () {
  // components that trigger resize 
  const
    resize_triggers = Array.from( document.querySelectorAll( '[resize-triggers]' ) );

  console.log( `Parts with resize triggers `, resize_triggers );

  resize_triggers.forEach( el => {
    const
      events_to_resize_on = el.getAttribute( 'resize-triggers' ).split( /\s+/g );
    // set timeout is necessary so that redraw can happen before we measure the size 
    events_to_resize_on.forEach( name => el.addEventListener( name, () => setTimeout( () => emit_resize( el ) , 0 ) ) );
  } );
}());

