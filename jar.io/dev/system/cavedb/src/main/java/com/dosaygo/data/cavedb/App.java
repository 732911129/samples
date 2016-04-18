package com.dosaygo.data.cavedb;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;

import java.io.IOException;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import java.util.stream.Collectors;


/**
 * CaveDb
 *
 */

public class App 
{

    public static void main( String[] args ) throws IOException {
      System.out.println( "Starting cave..." );
      String guid = Util.guid();
      System.out.println( "GUID: " + guid );
      String[] path = Util.divideGUID( guid );
      Path dir = Paths.get( "", path );
      System.out.println( dir );
      Util.stringToFile( args[ 0 ], "db", dir.toString(), "RAW" );
      System.out.println( Util.fileToString( "db", dir.toString(), "RAW" ) );
    }

    public static class Util
    {

      static final int[] GUID_DIVISIONS = { 0, 2, 15, 17, 30, 32, 34 };

      public static String guid() {
        return UUID.randomUUID().toString();
      }

      public static String fileToString( String... path ) throws IOException {
        return Files
          .lines( Paths.get( "", path ) )
          .collect( Collectors.joining( "\n" ) );
      }


      public static void stringToFile( String data, String... path ) throws IOException {
        Path filePath = Paths.get( "", path );
        Files.createDirectories( filePath.getParent() );
        Files.write( filePath, data.getBytes() );
      }

      public static String[] divideString( String whole, int[] part_origins ) {
        String[] divisions = new String[ part_origins.length ];
        for( int i = 0; i < part_origins.length; i++ ) {
          int part_origin = part_origins[ i ];
          if ( i < part_origins.length - 1 ) {
            int part_terminus = part_origins[ i + 1 ];
            divisions[ i ] = whole.substring( part_origin, part_terminus ); 
          } else {
            divisions[ i ] = whole.substring( part_origin );
          }
        }
        return divisions;
      }

      public static String[] divideGUID( String guid ) {
        return Util.divideString( guid, Util.GUID_DIVISIONS );
      }
      
      public static void save( ) {

      }

    }

}
