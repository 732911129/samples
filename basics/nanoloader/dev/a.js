self.loader.a = (function *() {
  yield 'b c';

  // code

  const const1 = 'MODULEA';

  class class1 {
    constructor() {
      this.kind = 'class1 instance';
    }
  }

  function fun1() {
    return Array.
      from( arguments ).
      map( ( arg, i ) => `${ i } : ${ (arg || {}).toString() }` ).
      join( ', ' );
  }

  yield { fun1, class1, const1 };
}());
