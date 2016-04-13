package com.dosaygo.app.service;

import java.lang.Class;

import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.file.Files;

import java.nio.charset.StandardCharsets;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

/**
 * Web Server request dispatcher
 *
 */

abstract public class Service implements HttpHandler {

  protected String serviceBase;
  protected String storageBase;
  private String pageCache;

  public Service( String storageBase ) throws IOException {
    this.serviceBase = new File( "." ).getCanonicalPath();
    System.out.println( this.serviceBase );
    this.storageBase = storageBase;
    this.pageCache = "";
  }

  protected String guid() {
    return UUID.randomUUID().toString();
  }


  protected Map<String, String> queryToMap(String query){
    Map<String, String> result = new HashMap<String, String>();
    for (String param : query.split("&")) {
      String pair[] = param.split("=");
      if (pair.length>1) {
        result.put(pair[0], pair[1]);
      }else{
        result.put(pair[0], "");
      }
    }
    return result;
  }

  protected void transformParameters( Map<String,String> params ) {
    // default is not parameter transformation
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

  public String name() {
    Class kind = this.getClass();
    return kind.getSimpleName().toLowerCase();
  }

  public void handleGet( HttpExchange e ) throws IOException {
    String response = this.getHTMLControl();
    Headers h = e.getResponseHeaders(); 
    h.set( "Content-Type", "text/html; charset=utf-8" );
    e.sendResponseHeaders( 200, response.length() );
    OutputStream os = e.getResponseBody();
    os.write( response.getBytes() );
    os.close();
  }

  abstract public void handlePost( HttpExchange e ) throws IOException;

  protected String getStoragePath( String name ) {
    return Paths.get( this.storageBase, "jar-io", "tmp", name + "-scratchdisk" ).toAbsolutePath().toString();
  }

  protected String storageRoot() {
    return this.getStoragePath( this.name() );
  }

  public String detailException ( Exception e ) {
    StringWriter sw = new StringWriter();
    e.printStackTrace( new PrintWriter( sw ) );
    return sw.toString();
  }

  public String streamToString( InputStream is ) throws IOException {
    StringWriter sw = new StringWriter();
    String encoding = StandardCharsets.UTF_8.name();
    InputStreamReader isr = new InputStreamReader( is, encoding );
    int c = 0;
    while( ( c = isr.read() ) != -1 ) {
      sw.write( c );
    }
    return sw.toString();
  }

  protected String getHTMLControl() {
    try { 
      Path htmlPath = Paths.get( this.serviceBase, "pages", this.name() + ".html" );
      if ( this.pageCache == "" ) {
        String page = new String( Files.readAllBytes( htmlPath ) );
        this.pageCache = page;
      }
    } catch ( IOException e ) {
      System.out.println( e );
    } finally { 
      return this.pageCache;
    }
  }

}

