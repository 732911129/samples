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
        System.out.println( "ARG 0: " + args[ 0 ] );
        System.out.println( Util.fileToString( args[ 0 ] ) );
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

    }
}
