package com.dosaygo.app.service;

import com.dosaygo.app.service.Service;

import java.util.List;

import java.io.IOException;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import java.nio.file.Files;
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

public class Downloader extends Service {

  @Override
  protected String name() {
    return "Downloader";
  }

  public Downloader( String storageBase ) throws IOException {
    super( storageBase );
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

}

