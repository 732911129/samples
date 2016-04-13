package com.dosaygo.app.service;

import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.io.InputStream;
import java.io.InputStreamReader;

import java.nio.charset.StandardCharsets;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

/**
 * Web Server request dispatcher
 *
 */

abstract public class Service implements HttpHandler {

  protected String storageBase;

  public Service( String storageBase ) {
    this.storageBase = storageBase;
  }

  protected String guid() {
    return UUID.randomUUID().toString();
  }


  public Map<String, String> queryToMap(String query){
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

  protected String name() {
    return "Service";
  }

  abstract public void handleGet( HttpExchange e ) throws IOException;

  abstract public void handlePost( HttpExchange e ) throws IOException;

  protected String storageRoot() {
    return this.name() + "-scratchdisk";
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
}

