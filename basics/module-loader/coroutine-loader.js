"use strict"; 

{
  // this is a minimal loader that uses coroutines
    const 
      loader = self.loader = Object.create( null ),
      module = self.module = Object.create( null );

    function completeModuleLoad( mod, whenModuleLoaded ) {
      self.module[ mod ] = self.loader[ mod ].next().value;
      whenModuleLoaded();
    }

    function insertScriptTag( p, whenLoaded ) {
      const tag = document.createElement( 'script' );
      tag.addEventListener( 'load', () => whenLoaded() );
      tag.src = p;
      document.documentElement.appendChild( tag );
    }

    function isNotWorker() {
      return ! self.constructor.name.includes( 'Worker' )
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
      const module_requires = self.loader[ name ].next().value;

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
      return 'https://media.dosaygo.com/codebase/js/' + name + '/first/code.js';
    }

    function requestModule( name, whenModuleLoaded ) {
      if( self.module[ name ] ) {
        console.info( `${ name } has already loaded.` );
        whenModuleLoaded();
      } else if ( self.loader[ name ] )
        console.info( `${ name } is already loading.` );
      else
        loadModule( name, whenModuleLoaded );
    }

  self.requestModule = requestModule;
}
