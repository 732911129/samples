package com.dosaygo.app.jar_io.service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import java.io.IOException;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
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

  public Downloader( String storageBase ) throws IOException {
    super( storageBase );
    this.progressStep = 9;
  }

  public void transformParameters( Map<String,String> params ) {
    String taskguid = params.get( "taskguid" );
    String zipPath = Paths.get( this.storageRoot(), taskguid, "compiled." + taskguid + ".zip" ).toAbsolutePath().toString();
    params.put( "taskguid", zipPath );
  }

  public void handlePost( HttpExchange e ) throws IOException {
    String body = this.streamToString( e.getRequestBody() );
    Map<String, String> params = this.queryToMap( body );
    HashMap<String, String> pure_params = new HashMap<String, String> ( params );
    String guid = params.get( "taskguid" );
    this.transformParameters( params );
    OutputStream os = null;
    try {
      Path zipPath = Paths.get( params.get( "taskguid" ) );
      Headers h = e.getResponseHeaders(); 
      String mime = "application/zip, application/octet-stream";
      byte[] download = Files.readAllBytes( zipPath );
      h.set( "Content-Type", mime );
      String filename = "compiled." + guid + ".zip";
      h.set( "Content-Disposition", "attachment; filename=" + filename );
      e.sendResponseHeaders( 200, 0 );
      os = e.getResponseBody();
      System.out.println( "DOWNLOAD -> " + filename + " ( " + mime + " ) " );
      os.write( download );
    } catch ( Exception ex ) {
      System.out.println( this.detailException( ex ) ); 
      e.sendResponseHeaders( 404, 0 );
      this.preface += "<br>An error occurred.";
      pure_params.put( "__responseMode", "contentOnly" );
      this.handleGet( e, pure_params );
      e.getResponseBody().close();
    } finally {
      if ( os != null ) {
        os.flush();
        os.close();
      }
    }
  }

  public String getBoundary( String header_value ) {
    String[] parts = header_value.split( ";", 2 );
    String[] boundary_slot = parts[ 1 ].split( "=", 2 );
    return boundary_slot[ 1 ];
  }

}

