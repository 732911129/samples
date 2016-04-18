package com.dosaygo.data.cavedb;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;

import java.io.IOException;

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
        Util.stringToFile( args[ 0 ], args[ 1 ] );
        System.out.println( Util.fileToString( args[ 1 ] ) );
    }

    public static class Util
    {

      public static String guid() {
        return UUID.randomUUID().toString();
      }

      public static String fileToString( String... path ) throws IOException {
        return Files
          .lines( Paths.get( "", path ) )
          .collect( Collectors.joining( "\n" ) );
      }


      public static void stringToFile( String data, String... path ) throws IOException {
        Files.write( Paths.get( "", path ), data.getBytes() );
      }

    }
}
