"use strict";
// this script reizes the embedding embed tag to fit the dimensions of the embedded content
// doing so on load and also on resize
{
  Object.defineProperty( String.prototype, 'subtract', { get : () => subtract } );

  function subtract( subtractand ) {
    let i = 0;
    while( i < this.length ) {
      if( this[ i ] !== subtractand[ i ] ) break;
      i++;
    }
    return this.slice( i );
  }
}
{
  function resize() {
    console.log( `Resizing` );
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
          embed[src="${ full_src }"],
          embed[src="${ absolute_src }"],
          embed[src="${ relative_src }"],
          embed[src$="${ relative_src }"]               
        `),
      rect = document.documentElement.getBoundingClientRect();

    console.log( `Seeking embed with src corresponding to ${ full_src }` );
    console.log( `Found: `, embed );
    console.log( `My content: `, rect );

    if( embed ) {
      embed.width = rect.width;
      embed.height = rect.height;
    }
  }
  resize();
  self.resize = resize;
}
{
  function emit_resize( target ) {
    const
      e = new CustomEvent( 'component-resize', { bubbles: true } );
    target.dispatchEvent( e ); 
  }
  self.emit_resize = emit_resize;
}
{
  // resize when custom event triggered. 
  document.addEventListener( 'component-resize', resize );
}
{
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
}

