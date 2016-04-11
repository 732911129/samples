package com.dosaygo.app;

import com.dosaygo.app.service.Uploader;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

/**
 * Web Server request dispatcher
 *
 */

public class Server {
  public static void main( String[] args ) throws Exception {
    System.out.println( "Starting server..." );
    HttpServer server = HttpServer.create( new InetSocketAddress( 8080 ), 0 );
    server.createContext( "/", new Dispatcher() );
    server.createContext( "/upload", new Uploader() );
    server.setExecutor( null );
    server.start();
  }

  static class Dispatcher implements HttpHandler {
    @Override
    public void handle( HttpExchange e ) throws IOException {
      String response = "<a href=/upload>Go to upload</a>";
      e.sendResponseHeaders( 200, response.length() );
      OutputStream os = e.getResponseBody();
      os.write( response.getBytes() );
      os.close();
    }
  }
}


