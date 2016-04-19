package com.dosaygo.data.cavedb;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;

import java.io.IOException;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.dosaygo.data.cavedb.App.CaveObjectType.*;


/**
 * CaveDb
 *
 */

public class App 
{

    public static void main( String[] args ) throws IOException, IllegalArgumentException {

      System.out.println( "Starting cave..." );
      List<String> data = Arrays.asList( args );
      CaveObject obj = new CaveObject( null, DATA, data );
      Cave c = new Cave( "." );
      String guid = c.saveObject( obj );
      CaveObject o2 = new CaveObject( guid, RAW, "NEW DATA".getBytes() );
      System.out.println( obj );
      System.out.println( guid );
      System.out.println( c.getObject( guid, DATA ) );
      c.saveObject( o2 );

    }

    public static enum CaveObjectType {

      DATA, RAW, MEDIA, TYPE

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

      public final String[] lines;

      public Media( String[] lines ) {
        this.lines = lines;
      }

      public Media( List<String> lines ) {
        this.lines = lines.toArray( new String[ lines.size() ] );
      }

    }

    public static class CaveObject 
    {

      public final String guid;
      public final CaveObjectType kind;
      public String type;
      public List<String> data;
      public byte[] raw;
      public Media media;

      private CaveObject( String guid, CaveObjectType kind ) {
        if( guid == null ) {
          guid = Cave.NEW_GUID;
        }
        this.guid = guid;
        this.kind = kind;
      }

      public CaveObject( String guid, CaveObjectType kind, String type ) {
        this( guid, kind );
        this.type = type;
      }

      public CaveObject( String guid, CaveObjectType kind, List<String> data ) {
        this( guid, kind );
        this.data = data;
      }

      public CaveObject( String guid, CaveObjectType kind, byte[] raw ) {
        this( guid, kind );
        this.raw = raw;
      }

      public CaveObject( String guid, CaveObjectType kind, Media media ) {
        this( guid, kind );
        this.media = media;
      }

    }

    public static class Cave
    {

      public static final String NEW_GUID = "NEW";
      public static final String ROOT = "cave";
      protected Path pathToCave;

      public Cave( String pathToCave ) {
        this.pathToCave = Paths
          .get( pathToCave, Cave.ROOT )
          .toAbsolutePath();
      }

      public Path getObjectPath( String guid, CaveObjectType kind ) {
        Path basePath = Paths.get( 
            this.pathToCave.toString(), 
            Util.divideGUID( guid ) 
          );
        Path objectPath = Paths.get( basePath.toString(), kind.name() );
        return objectPath;
      }

      public CaveObject getObject( String guid, CaveObjectType kind ) throws IOException {
        Path path = this.getObjectPath( guid, kind );
        List<String> data;
        String type;
        byte[] raw;
        Media media;
        CaveObject obj;
        switch( kind ) {
          case MEDIA:
            media = new Media( Util.fileToLines( path ) );
            obj = new CaveObject( guid, kind, media );
            break;
          case RAW:
            raw = Util.fileToBytes( path );
            obj = new CaveObject( guid, kind, raw );
            break;
          case DATA:
            data = Util.fileToLines( path );
            obj = new CaveObject( guid, kind, data );
            break;
          case TYPE:
            type = Util.fileToString( path );
            obj = new CaveObject( guid, kind, type );
            break;
          default:
            if ( kind == null ) {
              throw new NullPointerException( "CaveObjectType kind cannot be null." ); 
            } else {
              throw new UnsupportedOperationException( "CaveObjectType " + kind.name() + " is not an implemented CaveObject type." );
            }
        }
        return obj;
      }

      private void saveType( String guid, CaveObjectType kind ) throws IOException {
        Path type_path = this.getObjectPath( guid, TYPE );
        Util.stringToFile( kind.name(), type_path );
      }

      public String saveObject( CaveObject obj ) throws IOException, IllegalArgumentException {
        String guid = obj.guid;
        CaveObjectType kind = obj.kind;
        if ( guid == Cave.NEW_GUID ) {
          // TODO: code to check if GUID exists ? 
          guid = Util.guid();
        } else {
          Path type_path = this.getObjectPath( guid, TYPE );
          String type = Util.fileToString( type_path );
          if ( ! type.equals( kind.name() ) ) {
            throw new IllegalArgumentException( "The object's existing type of " + type + " cannot be changed to a different type " + kind.name() );
          }
        }
        this.saveType( guid, kind );
        Path path = this.getObjectPath( guid, kind );
        switch( kind ) {
          case MEDIA:
            Util.linesToFile( 
                Arrays.asList( obj.media.lines ), 
                path
              ); 
            break;
          case RAW:
            Util.bytesToFile( obj.raw, path );
            break;
          case DATA:
            Util.linesToFile( obj.data, path );
            break;
          case TYPE:
            Util.stringToFile( obj.type, path );
            break;
        }
        return guid;
      }

    }

}
