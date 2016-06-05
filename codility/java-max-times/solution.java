/**
 * This solution is copyright Cris Stringfellow 2016
 *
 **/

// you can also use imports, for example:
import java.util.Arrays;

import java.util.stream.Collectors;
import java.util.stream.Stream;

// you can write to stdout for debugging purposes, e.g.
// System.out.println("this is a debug message");

class MySolution {

    public String solution(int A, int B, int C, int D) {
        int[][] c1 = {
            new int[] { -1, 3 },
            new int[] { -1, 10 },
            new int[] { -1, 6 },
            new int[] { -1, 10 }
        };
        int[][] c2 = {
            new int[] { -1, 24 },
            new int[] { -1, 60 }
        };
        int [] x = { A, B, C, D };
        Arrays.sort( x );
        int [] t = { x[3], x[2], x[1], x[0] }; 
        int[] C1, C2;
        int[] a = { -1, -1, -1, -1 };
                
        assigner: for( int i = 0; i < c1.length; i++ ) {
            
            /**
             * System.out.println( "a: " + this.list( a ) );
             * System.out.println( "t: " + this.list( t ) );
             * 
             * Discovered the source of the bug.
             * I was assigning the computed hour or minute value ( instead of the position value )
             * when checking the C2 constraint.
             * So for example I was assigning the value 23 instead of 3 to a[ 1 ] 
             * Which was producing incorrect time strings
             * With this bug squashed, it now works on test cases given.
             * Let's try some sample test cases. 
             **/
             
            
            if( i % 2 == 1 ) {
                
                // check c2 constraint
            
                C2 = c2[ ( i - 1 ) / 2 ];
                
                for( int j = 0; j < t.length; j++ ) {
                    
                    int T = t[ j ];
                    
                    if ( T == -1 ) continue;
                    
                    T = a[ i - 1 ] * 10 + T;
                    
                    if ( T > C2[ 0 ] && T < C2[ 1 ] ) {
                        a[ i ] = t[ j ];
                        t[ j ] = -1;
                        if ( i == 3 ) {
                            return this.makeValidSolution( a );
                        } else {
                            continue assigner;
                        }
                    }
                }
                
                break assigner;
                
            } else {
            
                // check c1 constraint
                
                C1 = c1[ i ];
            
                for( int j = 0; j < t.length; j++ ) {
                    
                    int T = t[ j ];
                    
                    if ( T == -1 ) continue;
                    
                    if ( T > C1[ 0 ] && T < C1[ 1 ] ) {
                        a[ i ] = T;
                        t[ j ] = -1;
                        if ( i == 3 ) {
                            return this.makeValidSolution( a );
                        } else {
                            continue assigner;
                        }
                    }
                }
                
                break assigner;
                
            }
            
        }
        
        return makeNotPossibleSolution( a );
    }
    
    private String list( int[] a, String separator ) {
        return Arrays.stream( a )
            .mapToObj( n -> String.valueOf( n ) )   
            .collect( Collectors.joining( separator ) );
    }
    
    private String list( int[] a ) {
        return this.list( a, ", " );   
    }
    
    private String makeNotPossibleSolution( int[] a ) {
        return "NOT POSSIBLE";   
    }
    
    private String makeValidSolution( int[] a ) {
        String block = this.list( a, "" );
        return block.substring( 0, 2 ) + ":" + block.substring( 2, 4 );
    }

}
