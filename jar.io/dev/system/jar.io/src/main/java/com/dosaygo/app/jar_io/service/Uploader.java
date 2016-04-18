package com.dosaygo.app.jar_io.service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.EnumSet;

import java.io.IOException;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.ByteBuffer;
import java.nio.channels.SeekableByteChannel;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import org.apache.commons.fileupload.MultipartStream;

/**
 * Web Server request dispatcher
 *
 */

public class Uploader extends Service {

  public Uploader( String storageBase ) throws IOException {
    super( storageBase );
  }

  public void handlePost( HttpExchange e ) throws IOException {
    InputStream is = e.getRequestBody();
    ByteArrayOutputStream outs = new ByteArrayOutputStream();
    Headers h = e.getRequestHeaders();
    String boundary = this.getBoundary( h.get( "Content-Type" ).get( 0 ) );
    byte[] boundary_bytes = boundary.getBytes();
    int buf_size = boundary_bytes.length * 1024 * 1024;
    try {
      MultipartStream upload_stream = new MultipartStream( is, boundary_bytes, buf_size, null );
      boolean nextPart = upload_stream.skipPreamble();
      while( nextPart ) {
        String[] headers = upload_stream.readHeaders().split( "\\s*\\r?\\n\\s*" );
        Map<String, String> hm = new HashMap<String, String>();
        for( String header : headers ) {
          if ( header.matches( "(?ui)^content.*" ) ) {
            hm = this.headerToMap( header, hm );
          }
        }
        if ( hm.containsKey( "filename" ) ) {
          System.out.print( "UPLOAD <- " + hm.get( "filename" ) );
          if ( hm.containsKey( "content-type" ) ) {
            System.out.print( " ( " + hm.get( "content-type" ) + " )" );
          }
          System.out.println( "" );
        }
        upload_stream.readBodyData( outs );
        nextPart = upload_stream.readBoundary();
      }
    } catch ( MultipartStream.MalformedStreamException ex ) {
      System.out.println( this.detailException( ex ) );
    } catch ( IOException ex ) {
      System.out.println( this.detailException( ex ) );
    } finally {
      outs.flush();
      String guid = this.guid();
      Map<String, String> params = new HashMap<String, String>();
      params.put( "taskguid", guid );
      try { 
        Path guidRoot = Paths.get( this.storageRoot(), guid );
        Files.createDirectories( guidRoot );
        SeekableByteChannel fouts = Files.newByteChannel( Paths.get( guidRoot.toString(), "uploaded." + guid + ".zip" ), EnumSet.of( StandardOpenOption.CREATE, StandardOpenOption.APPEND, StandardOpenOption.WRITE ) );
        byte[] outsba = outs.toByteArray();
        ByteBuffer b = ByteBuffer.wrap( outsba );
        fouts.write( b );
        fouts.close();
        this.handleGet( e, params );
      } catch ( Exception ex ) {
        System.out.println( this.detailException( ex ) );
      }
    }
  }

  public String getBoundary( String header_value ) {
    return this.headerToMap( header_value ).get( "boundary" );  
  }

}

