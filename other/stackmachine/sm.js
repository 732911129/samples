"use strict";
// stack machine
{
  (function () {
    var 
      stack = [];

    function machine( exp ) {
      exp = exp + "";
      var
        parts = exp.split( /\s+(.+)/ ),
        type = parts[ 0 ], 
        tail = parts[ 1 ]; 
      switch( type ) {
        case "push":
          stack.push( tail );
          break;
        case "drop":
        case "pop":
          stack.pop()
          break;
        case "dup":
          stack.push( stack[ stack.length - 1 ] );
          break;
        case "over":
          stack.push( stack[ stack.length - 2 ] );
          break;
        case "rot":
          stack.push( stack.splice( -3, 1 )[ 0 ] );
          break;
        case "swap":
          stack.push( stack.splice( -2, 1 )[ 0 ] );
          break;
        case "add":
          stack.push( stack.pop() + stack.pop() );
          break;
        case "sub":
          stack.push( stack.pop() - stack.pop() );
          break;
        case "mul":
          stack.push( stack.pop() * stack.pop() );
          break;
        case "div":
          stack.push( stack.pop() / stack.pop() );
          break;
        case "mod":
          stack.push( stack.pop() % stack.pop() );
          break;
      }
    }
    Object.defineProperty( self, 'ins', { set : machine } );
    // debug
    self.stack = stack;
  }())
}
