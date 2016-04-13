package com.dosaygo.app;

import com.dosaygo.app.service.Service;
import com.dosaygo.app.service.Uploader;
import com.dosaygo.app.service.Downloader;
import com.dosaygo.app.service.CopyService;
import com.dosaygo.app.service.DezipService;
import com.dosaygo.app.service.BuildService;
import com.dosaygo.app.service.MavenBuildService;
import com.dosaygo.app.service.RezipService;

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
    if( args.length < 1 ) {
      System.out.println( "Specify a folder" );
      System.exit( 1 );
    }
    String folder = args[ 0 ];
    folder = folder.replaceFirst( "^~", System.getProperty( "user.home" ) );
    HttpServer server = HttpServer.create( new InetSocketAddress( 8080 ), 0 );
    server.createContext( "/", new Dispatcher( folder ) );
    server.createContext( "/upload", new Uploader( folder ) );
    server.createContext( "/dezip", new DezipService( folder ) );
    server.createContext( "/copy", new CopyService( folder ) );
    server.createContext( "/build", new BuildService( folder ) );
    server.createContext( "/maven_build", new MavenBuildService( folder ) );
    server.createContext( "/rezip", new RezipService( folder ) );
    server.createContext( "/download", new Downloader( folder ) );
    server.setExecutor( null );
    server.start();
  }

  static class Dispatcher extends Service {

    public Dispatcher( String storageBase ) throws IOException {
      super( storageBase ); 
    }

    public void handleGet( HttpExchange e ) throws IOException {
      String response = "<a href=/upload>Go to upload</a>";
      e.sendResponseHeaders( 200, response.length() );
      OutputStream os = e.getResponseBody();
      os.write( response.getBytes() );
      os.close();
    }

    public void handlePost( HttpExchange e ) throws IOException {
      this.handleGet( e );
    }

  }
}


