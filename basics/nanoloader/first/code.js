"use strict"; 

{
  // TODO:
    // separate release and local 
      // possibly look at improving logic in the use of local names
      // a more workable solution may be to simply mirror the dev environment
      // or to create a separate nano loader that can be used in dev environment
      // it seems unclean to mix local names with the actual directory structure of 
      // the relase
      // so likely a separate loader

  // this is a minimal loader that uses coroutines
    const 
      BASE_URI = '/codebase/js/',
      loader = self.loader = Object.create( null ),
      module = self.module = Object.create( null );

    function completeModuleLoad( name, whenModuleLoaded ) {
      self.module[ name ] = self.loader[ name ].next().value;
      whenModuleLoaded();
    }

    function insertScriptTag( p, whenLoaded ) {
      const tag = document.createElement( 'script' );
      tag.addEventListener( 'load', () => whenLoaded() );
      tag.src = p;
      document.documentElement.appendChild( tag );
    }

    function isLocalName( name ) {
      return name.startsWith( 'local.' );
    }

    function isNotWorker() {
      return ! self.constructor.name.includes( 'Worker' )
    }

    function isOffline() {
      return ! self.navigator.onLine;
    }

    function *loadModules( startLoading, totalModules, whenAllLoaded ) {
      let modulesRemaining = totalModules;

      do { 
        console.log( `Modules remaining to load ${ modulesRemaining }` );
        if( modulesRemaining == totalModules ) yield startLoading();
        else yield;
      } while( --modulesRemaining );

      whenAllLoaded();
    }

    function loadAllModules( module_names, whenAllLoaded ) {
      const
        loadedModules = loadModules( startLoading, module_names.length, whenAllLoaded );

      function startLoading() {
        while( module_names.length ) requestModule( module_names.pop(), () => loadedModules.next() );
      }

      return loadedModules.next();
    }

    function loadModule( name, whenModuleLoaded ) {
      loadModuleFile( name, _ => loadModuleRequirements( name, whenModuleLoaded ) );
    }

    function loadModuleFile( name, start_requirements_load ) {
      if( isNotWorker() ) 
        return insertScriptTag( path( name ), start_requirements_load );
      importScripts( path( name ) );
      start_requirements_load();
    }

    function loadModuleRequirements( name, whenModuleLoaded ) {
      module_requires = self.loader[ name ].next().value;

      loadRequirements( name, module_requires, whenModuleLoaded );
    }

    function loadRequirements( name, requires, whenModuleLoaded ) {
      const 
        requirementsLoader = loadRequirementsLoop(),
        whenRequirementLoaded = () => setTimeout( () => requirementsLoader.next(), 100 );

      requirementsLoader.next();
      requirementsLoader.next( { name, requires, whenRequirementLoaded, whenModuleLoaded } );
    }

    function *loadRequirementsLoop() {
      const 
        { name, requires, whenRequirementLoaded, whenModuleLoaded } = yield,
        names = requires.split( /\s+/g ).filter( n => n.length );

      while( names.length ) yield requestModule( names.pop(), whenRequirementLoaded );

      completeModuleLoad( name, whenModuleLoaded );
    }

    function path( name ) {
      return BASE_URI + name + '/first/code.js';
    }

    function requestModule( name, whenModuleLoaded ) {
      if( isLocalName( name ) ) 
        throw new TypeError( `This is the release variant of nanoloader. It cannot be used with local names. Use local.nanoloader for local names.` );
      if( self.module[ name ] ) {
        console.info( `${ name } has already loaded.` );
        whenModuleLoaded();
      } else if ( self.loader[ name ] )
        console.info( `${ name } is already loading.` );
      else {
        loadModule( name, whenModuleLoaded );
        self.loader[ name ] = { status : 'file requested, not yet loaded' };
      }
    }

    function requestModules( names, whenAllLoaded ) {
      const 
        module_names = [ ...new Set( names.split( /\s+/g ) ) ];
      loadAllModules( module_names, whenAllLoaded );
    }
    

  self.requestModules = requestModules;
}
