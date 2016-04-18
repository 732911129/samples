package com.dosaygo.app.jar_io;

import com.dosaygo.data.cavedb.App;

import com.dosaygo.app.service.Service;
import com.dosaygo.app.service.LoginService;
import com.dosaygo.app.service.Uploader;
import com.dosaygo.app.service.CopyService;
import com.dosaygo.app.service.DezipService;
import com.dosaygo.app.service.BuildService;
import com.dosaygo.app.service.MavenBuildService;
import com.dosaygo.app.service.RezipService;
import com.dosaygo.app.service.Downloader;
import com.dosaygo.app.service.LogoutService;

import java.util.Map;
import java.util.HashMap;
import java.io.IOException;
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
    System.out.println( "Working directory: " + folder );
    API api = new API();
    api.registerService( "/", new Dispatcher( folder ) );
    api.registerService( "/loginservice", new LoginService( folder ) );
    api.registerService( "/uploader", new Uploader( folder ) );
    api.registerService( "/dezipservice", new DezipService( folder ) );
    api.registerService( "/copyservice", new CopyService( folder ) );
    api.registerService( "/buildservice", new BuildService( folder ) );
    api.registerService( "/mavenbuildservice", new MavenBuildService( folder ) );
    api.registerService( "/rezipservice", new RezipService( folder ) );
    api.registerService( "/downloader", new Downloader( folder ) );
    api.registerService( "/logoutservice", new LogoutService( folder ) );
    api.publish();

  }

  static class API {

    protected Map<String,Service> services;
    protected HttpServer server;

    public API() throws IOException {
      this.server = HttpServer.create( new InetSocketAddress( 8080 ), 10 );
      this.services = new HashMap<String,Service> ();
    }

    public void registerService( String route, Service service ) {
      this.server.createContext( route, service ); 
      this.services.put( service.name(), service );
    }

    public void publish() {
      this.server.start();
    }

  }

  static class Dispatcher extends Service {

    public Dispatcher( String storageBase ) throws IOException {
      super( storageBase ); 
    }

    public void handlePost( HttpExchange e ) throws IOException {
      this.handleGet( e );
    }

  }

}


