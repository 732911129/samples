package com.dosaygo.app.service;

import java.util.List;

import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;

import java.nio.charset.StandardCharsets;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import org.apache.commons.fileupload.MultipartStream;

/**
 * Web Server request dispatcher
 *
 */

public class Uploader implements HttpHandler {

  public void handleGet( HttpExchange e ) throws IOException {
    String response = "<form enctype=multipart/form-data method=POST action=/upload><input name=file type=file><button>Up</button></form>";
    Headers h = e.getResponseHeaders(); 
    h.set( "Content-Type", "text/html; charset=utf-8" );
    e.sendResponseHeaders( 200, response.length() );
    OutputStream os = e.getResponseBody();
    os.write( response.getBytes() );
    os.close();
  }

  public String getBoundary( String header_value ) {
    String[] parts = header_value.split( ";", 2 );
    String[] boundary_slot = parts[ 1 ].split( "=", 2 );
    return boundary_slot[ 1 ];
  }

  public void handlePost( HttpExchange e ) throws IOException {
    InputStream is = e.getRequestBody();
    Headers h = e.getRequestHeaders();
    List<String> type_header = h.get( "Content-Type" );
    System.out.println( type_header.size() );
    String boundary = this.getBoundary( type_header.get( 0 ) );
    System.out.println( boundary );
    byte[] boundary_bytes = boundary.getBytes( StandardCharsets.UTF_8 );
    int buf_size = boundary_bytes.length * 1024 * 1024;
    MultipartStream upload_stream = new MultipartStream( is, boundary_bytes, buf_size, null );
    this.handleGet( e );
  }

  @Override
  public void handle( HttpExchange e ) throws IOException {
    String method = e.getRequestMethod();
    System.out.println( method );
    switch( method ) {
      case "GET":
          this.handleGet( e );
          break;
      case "POST":
          this.handlePost( e );
          break;
      default:
          this.handleGet( e );
          break;
    }
  }

}

