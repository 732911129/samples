package com.dosaygo.app.jar_io.service;

import java.lang.Class;

import java.util.Arrays;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedList;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

import com.dosaygo.data.cavedb.App.CaveHumanAPI;
import com.dosaygo.data.cavedb.App.CaveObject;

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
  protected String preface;
  protected final Map<String, String> inCookies;
  protected final Map<String, String> cookies;
  public final CaveHumanAPI humans;

  public Service( String storageBase ) throws IOException {
    this.inCookies = new HashMap<String, String> ();
    this.cookies = new HashMap<String, String> ();
    this.preface = "";
    this.serviceBase = Paths.get( ".", "jar.io" ).toAbsolutePath().toString();
    this.storageBase = storageBase;
    this.pageCache = "";
    this.humans = new CaveHumanAPI( "." );
  }
  
  protected String guid() {
    return UUID.randomUUID().toString();
  }

  protected Map<String, String> queryToMap(String query){
    // SECURITY: sanitise params at this point
      // If different services have differing requiremments 
      // then include a HTTP context in this method to determine
      // the santiszation requirements on a per request and service context
      // basis
    Map<String, String> result = new HashMap<String, String> ();
    Arrays.asList( query.split( "&" ) ).stream()
      .map( param -> param.split( "=" ) )
      .forEach( pair -> result.put( pair[ 0 ], pair.length > 1 ? pair[ 1 ] : "" ) );
    return result;
  }
  
  public void clientCookiesToMap( HttpExchange e, Map<String, String> cookies ) {
    Map<String, List<String>> headers = e.getRequestHeaders();
    List<String> cookieHeaders = headers.get( "cookie" );
    if ( cookieHeaders != null ) {
      cookieHeaders.stream()
        .map( cookieHeader -> cookieHeader.split( "\\s*;\\s*" ) )
        .map( cookieArray -> Arrays.asList( cookieArray ) )
        .forEach( cookieList -> {
            cookieList.stream()
              .map( keyValue -> keyValue.split( "\\s*=\\s*" ) )
              .forEach( pair -> cookies.put( pair[ 0 ], pair[ 1 ] ) );
          } );
    }
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
    
    // SECURITY
      // Check if JARIOSESSION cookie is set
      // and retrieve the session object
      // making it available as a variable on the request
    try { 
      this.cookies.clear();
      this.inCookies.clear();
      this.clientCookiesToMap( e, this.inCookies );
      this.preface = "";
      String method = e.getRequestMethod();
      String uri = e.getRequestURI().toString();
      CaveObject session = LoginService.getSession( this, e );
      System.out.println( method + " " + uri );
      switch( method ) {
        case "GET":   this.handleGet( e ); break;
        case "POST":  this.handlePost( e ); break;
        default:      this.handleGet( e ); break;
      }
    } catch ( Throwable ex ) {
      System.out.println( this.detailThrowable( ex ) );
    }

  }

  public String getPreface() {
    return this.preface;
  }

  public String name() {
    Class kind = this.getClass();
    return kind.getSimpleName().toLowerCase();
  }

  public String template( String page, Map<String, String> params ) {
    LinkedList<String> iterations = new LinkedList<String>();
    params.put( "service_name", this.name() );
    iterations.add( page );
    // template each parameter slot in turn
    params.forEach( ( key, value ) -> iterations.add( iterations.getLast().replaceAll( "::" + key, value ) ) );
    // remove any untemplated slots from the page
    iterations.add( iterations.getLast().replaceAll( "::\\w+", "" ) );
    return iterations.getLast();
  }

  public void handleGet( HttpExchange e ) throws IOException {
    this.handleGet( e, null );
  }

  public void goHeaders( int status, HttpExchange e ) throws IOException {
    Headers h = e.getResponseHeaders(); 
    h.set( "Content-Type", "text/html; charset=utf-8" );
    this.cookies.forEach( ( key, value ) -> {
      h.set( "Set-Cookie", key + "=" + value + "; path=/; HttpOnly" );
    } );
    e.sendResponseHeaders( status, 0 );
  }

  public void handleGet( HttpExchange e, Map<String, String> params ) throws IOException {
    
    boolean contentOnly = false;

    if( params == null ) {
      params = this.uriParams( e );
    }

    if( "contentOnly".equals( params.get( "__responseMode" ) ) ) {
      contentOnly = true;
    }
    
    if ( ! contentOnly ) {
      this.goHeaders( 200, e );
    }
    
    String page = "<!DOCTYPE html><html>" + 
                    this.getHTMLHeader() + 
                    this.getPreface() + 
                    this.getHTMLControl() + 
                    this.getHTMLNavigation();

    if ( ! contentOnly ) {
      page += "</body></html>";
    }

    if( params != null ) {
      page = this.template( page, params );
    }
    
    OutputStream os = e.getResponseBody();
    os.write( page.getBytes() );

    if ( ! contentOnly ) {
      os.close();
    }
  
  }

  abstract public void handlePost( HttpExchange e ) throws IOException;

  protected String getStoragePath( String name ) {
    return Paths.get( this.storageBase, "jar-io", "tmp", name + "-scratchdisk" ).toAbsolutePath().toString();
  }

  protected String storageRoot() {
    return this.getStoragePath( this.name() );
  }

  public Map<String, String> bodyParams( HttpExchange e ) throws IOException {
    Map<String, String> params = new HashMap<String, String> ();
    String body = this.streamToString( e.getRequestBody() );
    if ( body != null ) {
      params = this.queryToMap( body );
    }
    return params;
  }

  public Map<String, String> uriParams( HttpExchange e ) throws IOException {
    Map<String, String> params = new HashMap<String, String> ();
    String query = e.getRequestURI().getQuery();
    if( query != null ) {
      params = this.queryToMap( query );
    }
    return params;
  }

  public String detailException ( Throwable e ) {
    StringWriter sw = new StringWriter();
    e.printStackTrace( new PrintWriter( sw ) );
    return sw.toString();
  }

  public String detailThrowable( Throwable e ) {
    return this.detailException( e );
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

  protected String getHTMLHeader() {
    String header = "";
    try { 
      header = this.getHTML( "shared", "header.html" );
    } catch ( IOException e ) {
      System.out.println( e );
    } finally { 
      return header;
    }
  }

  protected String getHTMLControl() {
    if ( true || this.pageCache == "" ) {
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

