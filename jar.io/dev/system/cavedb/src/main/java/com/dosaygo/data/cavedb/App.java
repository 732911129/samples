package com.dosaygo.data.cavedb;

import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;

import java.io.IOException;

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Base64;

import static com.dosaygo.data.cavedb.App.CaveObjectType.*;


/**
 * CaveDb
 *
 */

public class App 
{

    public static void main( String... args ) throws IOException, IllegalArgumentException {

      System.out.println( "Current working directory: " );
      System.out.println( Paths.get( "." ).toAbsolutePath().toString() );
      System.out.println( "Starting cave..." );
      List<String> data = Arrays.asList( args );
      CaveAPI api = new CaveAPI( "." );
      if ( "raw".equals( args[ 0 ] ) ) { 
        if ( args.length > 2 ) {
          api.storeFile( args[ 1 ], args[ 2 ] ); 
        }
        String file = api.getFileAsString( args[ 1 ] );
        System.out.println( file );
      } else if ( "media".equals( args[ 0 ] ) ) {
        if ( args.length > 2 ) {
          api.storeMedia( args[ 1 ], args[ 2 ] ); 
        }
        Media media = api.getMedia( args[ 1 ] );
        System.out.println( media );
        System.out.println( media.getSlot( "age" ) );
      }

    }

    public static enum CaveObjectType {

      DATA, RAW, MEDIA, TYPE

    }

    public static class Util
    {

      static final int[] GUID_DIVISIONS = { 0, 2, 4, 6, 7, 10, 12 };
      static final Base64.Decoder b64decoder = Base64.getDecoder();

      // double utils
        public static byte[] doubleToBytes( double source ) {
          byte[] bytes = new byte[ 8 ];
          ByteBuffer.wrap( bytes ).putDouble( source );
          return bytes;
        }

        public static double bytesToDouble( byte[] source ) {
          return ByteBuffer.wrap( source ).getDouble();
        }

      // base64 utils
        public static String b64ToString( String encoded ) {
          return new String( Util.b64ToBytes( encoded ) );
        }
        
        public static byte[] b64ToBytes( String encoded ) {
          return Util.b64decoder.decode( encoded );
        }

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

    public static final class Slot 
    {

      public final String typeName;
      public final String slotName;
      public final String value;

      public Slot( String slotName, String typeName, String value ) throws IllegalArgumentException {
        if( slotName == null || typeName == null || value == null ) {
          throw new IllegalArgumentException( "A Slot has all String parts, and the parts here were : " + slotName + ", " + typeName + ", " + value );
        }
        this.slotName = slotName;
        this.typeName = typeName;
        this.value = value;
      }

      public Slot( String[] triple ) throws IllegalArgumentException {
        this( triple[ 0 ], triple[ 1 ], triple[ 2 ] );
      }

      public Slot( String normalLine ) throws IllegalArgumentException {
        this( normalLine.split( "\\s+", 3 ) );
      }

      public static Slot b64ToSlot( String base64EncodedSlotLine ) throws IllegalArgumentException {
        return new Slot( Util.b64ToString( base64EncodedSlotLine ) );
      }

      public Media media() {
        return new Media( this.multilineString() );
      }

      public String string() {
        return this.value;
      }

      public String multilineString() {
        return Util.b64ToString( this.value );
      }

      public double number() {
        return Util.bytesToDouble( this.bytes() );
      }

      public byte[] bytes() {
        return Util.b64ToBytes( this.value ); 
      }
      
      public String toString() {
        return this.slotName + " " + this.typeName + " " + this.value;
      }

    }

    public static final class Media 
    {

      public final String typeName;
      public final String[] lines;
      public final List<Slot> slots;
      public final Map<String,Slot> slotsByName;

      public Media( String source ) throws IllegalArgumentException {
        this( source.split( "\\r?\\n" ) );
      }
      
      private void makeSlot( String line ) throws IllegalArgumentException {
        if ( line.trim().length() > 0 ) {
          System.out.println( line );
          Slot s = new Slot( line );
          this.slotsByName.put( s.slotName, s );
          this.slots.add( s );
        }
      }

      public Slot getSlot( String name ) {
        return this.slotsByName.get( name );
      }

      public Media( String[] lines ) throws IllegalArgumentException {
        this.lines = lines;
        this.slots = new ArrayList<Slot>();
        this.slotsByName = new HashMap<String,Slot>();
        this.typeName = this.lines[ 0 ];
        Arrays.asList( this.lines )
          .stream()
          .skip( 1 )
          .forEach( line -> this.makeSlot( line ) ); 
      }

      public Media( List<String> lines ) {
        this( lines.toArray( new String[ lines.size() ] ) );
      }
      
      public String toString() {
        return this.typeName + "\n" + 
          this.slots
            .stream()
            .map( slot -> slot.toString() )
            .collect( Collectors.joining( "\n" ) );
      }

    }

    public static final class CaveObject 
    {

      public final String guid;
      public final CaveObjectType kind;
      public String name;
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

    public static final class Cave
    {

      public static final String NEW_GUID = "NEW";
      public static final String ROOT = "cave";
      public static final String NAME_ROOT = "name";
      protected Path pathToCave;

      public Cave( String pathToCave ) {
        this.pathToCave = Paths
          .get( pathToCave, Cave.ROOT )
          .toAbsolutePath();
      }

      private CaveObjectType getKind( String guid ) throws IOException {
        Path type_path = this.getObjectPath( guid, TYPE );
        String type = Util.fileToString( type_path );
        CaveObjectType kind = CaveObjectType.valueOf( type );
        return kind;
      }

      public Path getObjectPath( String guid, CaveObjectType kind ) {
        Path basePath = Paths.get( 
            this.pathToCave.toString(), 
            Util.divideGUID( guid ) 
          );
        Path objectPath = Paths.get( basePath.toString(), kind.name() );
        return objectPath;
      }

      public CaveObject getObject( String guid ) throws IOException {
        CaveObjectType kind = this.getKind( guid );
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

      public String guidFromName( String name ) throws IOException {
        Path namePath = Paths.get( Cave.ROOT, Cave.NAME_ROOT, name );
        String guid = Util.fileToString( namePath );
        return guid;
      }

      public CaveObject objectFromName( String name ) throws IOException {
        String guid = this.guidFromName( name );
        return this.getObject( guid );
      }

      private void saveName( String name, String guid ) throws IOException {
        Path namePath = Paths.get( Cave.ROOT, Cave.NAME_ROOT, name );
        Util.stringToFile( guid, namePath );
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
        if ( obj.name != null ) {
          this.saveName( obj.name, guid );
        }
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
  
    public static class CaveAPI 
    {
      
      public final Cave db;

      public CaveAPI( String pathToCave ) {
        this.db = new Cave( pathToCave );
      }

      public void storeMedia( String name, String... path ) throws IOException, IllegalArgumentException {
        List<String> lines = Util.fileToLines( path );
        Media media = new Media( lines );
        CaveObject mediaObject = new CaveObject( null, MEDIA, media );
        if ( name == null ) {
          name = Paths.get( "", path ).toString();
        }
        mediaObject.name = name;
        this.db.saveObject( mediaObject );
      }

      public Media getMedia( String name ) throws IOException, IllegalArgumentException {
        CaveObject obj = this.db.objectFromName( name );
        return obj.media;
      }

      public void storeFile( String name, String... path ) throws IOException, IllegalArgumentException {
        byte[] fileBytes = Util.fileToBytes( path );
        CaveObject fileObject = new CaveObject( null, RAW, fileBytes );
        if ( name == null ) {
          name = Paths.get( "", path ).toString();
        }
        fileObject.name = name;
        this.db.saveObject( fileObject );
      }

      public byte[] getFileAsBytes( String name, String... path ) throws IOException, IllegalArgumentException {
        if ( path.length > 0 ) {
          name = Paths.get( "", path ).toString();
        }
        if ( name == null ) {
          throw new IllegalArgumentException( "getFile must receive a name or path." );
        }
        CaveObject fileObject = this.db.objectFromName( name );
        return fileObject.raw;
      }

      public String getFileAsString( String name, String... path ) throws IOException, IllegalArgumentException {
        System.out.println( name );
        for( String p : path ) {
          System.out.println( p );
        }
        byte[] fileBytes = this.getFileAsBytes( name, path );
        return new String( fileBytes );
      }

    }

}
