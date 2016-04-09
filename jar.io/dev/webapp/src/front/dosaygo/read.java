package dosaygo;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

public class read {
  public static void main( String args[] ) throws Exception {
    Stream<String> lines = Files.lines( Paths.get( args[ 0 ] ) );
    lines.forEach( s -> System.out.println( s ) );
  }
}
