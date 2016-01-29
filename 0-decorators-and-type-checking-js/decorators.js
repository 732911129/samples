{
    function dec1( strings, ...values ) {
      console.log( `Running dec1`, strings, values );
      return `dec1`;
    };
    function dec2( strings, ...values ) {
      console.log( `Running dec2`, strings, values );
      return `dec2`;
    }
 
  class Test {
    [ dec1`fun1 ${{ a : String, b : Number }} ${ Array }` ](){}
    fun1() { console.log(`fun 1`); }
    [ dec2`fun2 ${{ a : String, b : Number, c : Array }} ${ Array }` ](){}
    fun2() { console.log(`fun 2`); }
  }

  const t = new Test();
  self.t = t;
}
