package com.dosaygo.app.service;

import java.lang.Class;

import java.util.Arrays;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedList;

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
    this.storageBase = storageBase;
    this.pageCache = "";
  }

  protected String guid() {
    return UUID.randomUUID().toString();
  }


  protected Map<String, String> queryToMap(String query){
    Map<String, String> result = new HashMap<String, String> ();
    Arrays.asList( query.split( "&" ) ).stream()
      .map( param -> param.split( "=" ) )
      .forEach( pair -> result.put( pair[ 0 ], pair.length > 1 ? pair[ 1 ] : "" ) );
    return result;
  }
  
  public Map<String, String> headerToMap( String header ) {
    return this.headerToMap( header, null );
  }
  
  public Map<String, String> headerToMap( String header, Map<String, String> existing ) {
    Map<String, String> result = new HashMap<String, String> ();
    Arrays.asList( header.split( ";" ) ).stream()
      .map( param -> param.split( "[:=]" ) )
      .forEach( pair -> result.put( pair[ 0 ].trim().toLowerCase(), pair.length > 1 ? pair[ 1 ].trim() : "" ) );
    if ( existing == null ) {
      return result;
    } else {
      existing.putAll( result );
      return existing;
    }
  }  


  protected void transformParameters( Map<String,String> params ) {
    // default is no parameter transformation
  }

  @Override
  public void handle( HttpExchange e ) throws IOException {
    String method = e.getRequestMethod();
    String uri = e.getRequestURI().toString();
    System.out.println( method + " " + uri );
    switch( method ) {
      case "GET":   this.handleGet( e ); break;
      case "POST":  this.handlePost( e ); break;
      default:      this.handleGet( e ); break;
    }
  }

  public String name() {
    Class kind = this.getClass();
    return kind.getSimpleName().toLowerCase();
  }

  public String template( String page, Map<String, String> params ) {
    LinkedList<String> iterations = new LinkedList<String>();
    params.put( "service_name", this.name() );
    iterations.add( page );
    params.forEach( ( key, value ) -> iterations.add( iterations.getLast().replace( "::" + key, value ) ) );
    return iterations.getLast();
  }

  public void handleGet( HttpExchange e ) throws IOException {
    this.handleGet( e, null );
  }

  public void handleGet( HttpExchange e, Map<String, String> params ) throws IOException {
    
    if( params == null ) {
      String query = e.getRequestURI().getQuery();
      if( query != null ) {
        params = this.queryToMap( query );
      }
    }
    
    Headers h = e.getResponseHeaders(); 
    h.set( "Content-Type", "text/html; charset=utf-8" );
    e.sendResponseHeaders( 200, 0 );
    
    String page = this.getHTMLControl() + this.getHTMLNavigation();
    if( params != null ) {
      page = this.template( page, params );
    }
    
    OutputStream os = e.getResponseBody();
    os.write( page.getBytes() );
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
    if ( this.pageCache == "" ) {
      try { 
        this.pageCache = this.getHTML( this.name() + ".html" );
      } catch ( IOException e ) {
        System.out.println( e );
      }
    }
    return this.pageCache;
}

  protected String getHTML( String ... path ) throws IOException {
    Path htmlPath = Paths.get( this.serviceBase, Paths.get( "pages", path ).toString() );
    return new String( Files.readAllBytes( htmlPath ) );
  }

  protected String getHTMLNavigation() {
    String nav = "";
    try { 
      nav = this.getHTML( "shared", "navigation.html" );
    } catch ( IOException e ) {
      System.out.println( e );
    } finally { 
      return nav;
    }
  }

}

