package com.dosaygo.app.service;

import com.dosaygo.app.service.Service;

import java.util.List;

import java.io.IOException;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import java.nio.file.Files;
import java.nio.file.Path;
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

  @Override
  protected String name() {
    return "Uploader";
  }

  public void handleGet( HttpExchange e ) throws IOException {
    String response = "<form enctype=multipart/form-data method=POST action=/upload><input name=file type=file><button>Up</button></form>";
    Headers h = e.getResponseHeaders(); 
    h.set( "Content-Type", "text/html; charset=utf-8" );
    e.sendResponseHeaders( 200, response.length() );
    OutputStream os = e.getResponseBody();
    os.write( response.getBytes() );
    os.close();
  }

  public void handlePost( HttpExchange e ) throws IOException {
    InputStream is = e.getRequestBody();
    ByteArrayOutputStream outs = new ByteArrayOutputStream();
    OutputStream buf = e.getResponseBody();
    Headers oh = e.getResponseHeaders();
    oh.set( "Content-Type", "text/html" );
    e.sendResponseHeaders( 200, 0 );
    Headers h = e.getRequestHeaders();
    List<String> type_header = h.get( "Content-Type" );
    System.out.println( type_header.size() );
    String boundary = this.getBoundary( type_header.get( 0 ) );
    System.out.println( boundary );
    byte[] boundary_bytes = boundary.getBytes();
    int buf_size = boundary_bytes.length * 1024 * 1024;
    try {
      MultipartStream upload_stream = new MultipartStream( is, boundary_bytes, buf_size, null );
      boolean nextPart = upload_stream.skipPreamble();
      while( nextPart ) {
        String header = upload_stream.readHeaders();
        System.out.println( header );
        upload_stream.readBodyData( outs );
        nextPart = upload_stream.readBoundary();
      }
    } catch ( MultipartStream.MalformedStreamException ex ) {
      System.out.println( this.detailException( ex ) );
    } catch ( IOException ex ) {
      System.out.println( this.detailException( ex ) );
    } finally {
      String guid = this.guid();
      try { 
        Path guidRoot = Paths.get( this.storageRoot(), guid );
        Files.createDirectories( guidRoot );
        Files.write( Paths.get( guidRoot.toString(), guid + ".zip" ), outs.toByteArray() );
        buf.write( guid.getBytes() );
        buf.close();
      } catch ( IOException ex ) {
        System.out.println( this.detailException( ex ) );
      }
    }
  }

  public String getBoundary( String header_value ) {
    String[] parts = header_value.split( ";", 2 );
    String[] boundary_slot = parts[ 1 ].split( "=", 2 );
    return boundary_slot[ 1 ];
  }

}

