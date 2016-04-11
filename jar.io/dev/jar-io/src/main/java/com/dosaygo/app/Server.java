package com.dosaygo.app;

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
    server.setExecutor( null );
    server.start();
  }

  static class Dispatcher implements HttpHandler {
    @Override
    public void handle( HttpExchange e ) throws IOException {
      String response = "Hi there.";
      e.sendResponseHeaders( 200, response.length() );
      OutputStream os = e.getResponseBody();
      os.write( response.getBytes() );
      os.close();
    }
  }
}


