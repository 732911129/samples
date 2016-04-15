package com.dosaygo.app.service;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

import java.lang.ProcessBuilder;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.nio.file.Paths;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

/**
 * Web Server request dispatcher
 *
 */

public class CopyService extends RuntimeService {

  public CopyService( String storageBase ) throws IOException {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "taskguid current_service next_service";
  }

  @Override
  protected String command() {
    return "copynode";
  }

  @Override
  public void handleGet( HttpExchange e, Map<String, String> params ) throws IOException {
    if( params == null ) {
      String query = e.getRequestURI().getQuery();
      if( query != null ) {
        params = this.queryToMap( query );
      }
    }
    // execute & redirect
    if( "execute".equals( params.get( "mode" ) ) ) {
      Map<String, String> execute_params = new HashMap<String, String> ( params );
      this.execute( execute_params );
      Headers h = e.getResponseHeaders(); 
      String redirectTo = "/" + params.get( "next_service" ) + "?taskguid=" + params.get( "taskguid" );
      System.out.println( "redirect: " + redirectTo );
      h.set( "Location", redirectTo );
      e.sendResponseHeaders( 302, -1 );
    } else {
      super.handleGet( e, params );
    }
  }

  @Override
  public void transformParameters( Map<String,String> params ) {
    List<String> l = new ArrayList<String>( Arrays.asList( "current_service", "next_service" ) );
    l.forEach( key -> params.put( key, this.getStoragePath( params.get( key ) ) ) );
  }

}

