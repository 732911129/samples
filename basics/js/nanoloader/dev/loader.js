"use strict";

{
  // zero dependency module loader
  // totally crazy
  // in < 100 SLOC

  const
    SENSOR_TAG = 'DEPENDENCYSENSINGWORKER',
    base_uri = `https://media.dosaygo.com/codebase/js/first/`,
    wp = 'https://media.dosaygo.com/boot/loader.js',
    dep_map = Object.create( null ), // dependencies
    exp_map = Object.create( null ), // exports
    Ws = [],
    Ms = [];

  function decache() {
    return 'decache=' + Math.random();    
  }
  
  function path( name ) {
    return base_uri + name + '.js?' + decache();
  }
  
  function unpath( p ) {
    return p.replace( base_uri, '' ).split( '.js?' )[ 0 ];
  }

  // using get trap handler
  function gth( m ) {
    if( self.constructor.name == "WorkerGlobalScope" && self.location.search.includes( SENSOR_TAG ) )
      // if we're in a sensing worker, save the dependency
      Ms.push( { m, p : path( m ), dep : [] } );
    else if( ! self.imports[ m ] ) 
      throw new TypeError( `Import ${ m } was requested and is not available.` );
    else 
      console.log( `Import ${ m } is available.` );
    return U;
  }

  // using call trap handler 
  function cth( target, thisArg, args ) {
    // if we're in a sensing worker, send dependencies back through the wormhole
    if( self.constructor.name == "WorkerGlobalScope" && self.location.search.includes( SENSOR_TAG ) );
      throw new RuntimeError( JSON.stringify( Ms ) );
    // otherwise no effect
  }

  // load a dependency sensing worker
  function ldsw( m ) {
    const 
      w = new Worker( wp + '&p=' + encodeUriComponent( path( m ) ) );
    w.onerror = e => accept_dependencies( m, e );
    Ws.push( w );
  }
  
  // to kick things off, we start with load( <module_name> );
  function load( m ) {
    dep_map[ m ] = [];
    ldsw( path( m ) );
  }
  
  // accept dependencies 
  function accept_dependencies( m, e ) {
    dep_map[ m ].push( ...JSON.parse( e.detail ) );
    e.target.terminate();
  }
  
  const 
    IMPORTS = exp_map,
    USING_PROXY = Proxy( {}, { 
      apply : cth,
      get : gth
    } );
  
  // create the using proxy
  Object.defineProperty( self, 'using', { get : () => USING_PROXY } );
  
  // creating the exporting setter
  Object.defineProperty( self, 'exporting', { set : EXPORT } );
  
  // create the imports getter 
  Object.defineProperty( self, 'imports', { get : () => IMPORTS } );
  
  function EXPORT( map ) {
    // get module name 
    const m = unpath( self.currentScript.src );
    exp_map[ m ] = map;
  }

}
