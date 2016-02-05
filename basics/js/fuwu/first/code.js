"use strict";

self.loader.fuwu = (function*() {
  {
    yield '';
  
      // Private constant
      
       const $ = Symbol( `[[ Private ]]` );
  
      // Stringable class
    
       
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
  
  
    // general array and dictionary helpers 
    
        function add_if_absent( value, list ) {
          if( ! list.includes( value ) )
            list.push( value );
          return list;
        }
  
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
  
        function set( map, ...flat_entries ) {
          for( let i = 0; i < flat_entries.length - 1; i+=2 )
            map[ flat_entries[ i ] ] = flat_entries[ i + 1 ]; 
          return map;
        }
  
    yield { 
      Stringable,
      add_if_absent,
      append,
      append_at_key,
      blank,
      flatten_map_of_lists,
      map_by_keys,
      relabel_entries,
      set
    };
  }
}());
