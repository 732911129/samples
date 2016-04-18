package com.dosaygo.data.cavedb;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;

import java.io.IOException;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.dosaygo.data.cavedb.App.CaveObject.*;


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

    public static enum CaveObject {
      DATA, RAW, MEDIA
    }

    public static interface Encaveable {

      public String toString();
      public byte[] getBytes();
      public void fromString( String source );
      public void fromBytes( byte[] source );
       
    }

    public static class Util
    {

      static final int[] GUID_DIVISIONS = { 0, 2, 15, 17, 30, 32, 34 };

      // guid utils 
        public static String[] divideGUID( String guid ) {
          return Util.divideString( guid, Util.GUID_DIVISIONS );
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

        public static String guid() {
          return UUID.randomUUID().toString();
        }

      // file getters 
        public static byte[] fileToBytes( Path path ) throws IOException {
          return Files.readAllBytes( path );
        }

        public static byte[] fileToBytes( String... path ) throws IOException {
          return Util.fileToBytes( Paths.get( "", path ) );
        }

        public static List<String> fileToLines( Path path ) throws IOException {
          return Files.readAllLines( path );
        }

        public static List<String> fileToLines( String... path ) throws IOException {
          return Util.fileToLines( Paths.get( "", path ) );
        }

        public static String fileToString( Path path ) throws IOException {
          return Util.fileToLines( path )
            .stream()
            .collect( Collectors.joining( "\n" ) );
        }

        public static String fileToString( String... path ) throws IOException {
          return Util.fileToString( Paths.get( "", path ) );
        }

      // file savers 
        public static void bytesToFile( byte[] data, Path filePath ) throws IOException {
          Files.createDirectories( filePath.getParent() );
          Files.write( filePath, data );
        }

        public static void bytesToFile( byte[] data, String... path ) throws IOException {
          Path filePath = Paths.get( "", path );
          Util.bytesToFile( data, filePath );
        }

        public static void stringToFile( String data, Path path ) throws IOException {
          Util.bytesToFile( data.getBytes(), path );
        }

        public static void stringToFile( String data, String... path ) throws IOException {
          Util.bytesToFile( data.getBytes(), path );
        }

        public static void linesToFile( List<String> lines, Path filePath ) throws IOException {
          Files.createDirectories( filePath.getParent() );
          Files.write( filePath, lines );
        }

        public static void linesToFile( List<String> lines, String...path ) throws IOException {
          Util.linesToFile( lines, Paths.get( "", path ) );
        }

    }

    public static class Media 
    {

      public String[] lines;

      public Media( String[] lines ) {
        this.lines = lines;
      }

    }

    public static class Cave
    {

      protected Path pathToCave;

      public Cave( String pathToCave ) {
        this.pathToCave = Paths.get( pathToCave ).toAbsolutePath();
      }

      public Path getObjectPath( String guid, CaveObject kind ) {
        Path basePath = Paths.get( 
            this.pathToCave.toString(), 
            Util.divideGUID( guid ) 
          );
        Path objectPath = Paths.get( basePath.toString(), kind.name() );
        return objectPath;
      }

      public Media getMedia( String guid ) throws IOException {
        Path path = this.getObjectPath( guid, MEDIA );
        List<String> lines = Util.fileToLines( path );
        return new Media( lines.toArray( new String[ lines.size() ] ) );
      }

      public String getData( String guid ) throws IOException {
        Path path = this.getObjectPath( guid, DATA );
        String data = Util.fileToString( path );
        return data;
      }

      public byte[] getRaw( String guid ) throws IOException {
        Path path = this.getObjectPath( guid, RAW );
        byte[] bytes = Util.fileToBytes( path );
        return bytes;
      }

      public void saveMedia( String guid, Media media ) throws IOException {
        Util.linesToFile( 
            Arrays.asList( media.lines ), 
            this.getObjectPath( guid, MEDIA ) 
          ); 
      }

      public void saveData( String guid, String data ) throws IOException {
        Util.stringToFile( data, this.getObjectPath( guid, DATA ) );
      }

      public void saveRaw( String guid, byte[] raw ) throws IOException {
        Util.bytesToFile( raw, this.getObjectPath( guid, RAW ) );
      }

    }
}
