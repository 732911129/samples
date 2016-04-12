package com.dosaygo.app.service;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

/**
 * Web Server request dispatcher
 *
 */

abstract public class Service implements HttpHandler {

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

  abstract public String name();

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

}

