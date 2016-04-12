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
    String folder = args[ 1 ];
    HttpServer server = HttpServer.create( new InetSocketAddress( 8080 ), 0 );
    server.createContext( "/", new Dispatcher( folder ) );
    server.createcontext( "/upload", new Uploader( folder ) );
    server.createcontext( "/dezip", new DezipService( folder ) );
    server.createcontext( "/copy", new CopyService( folder ) );
    server.createcontext( "/build", new BuildService( folder ) );
    server.createcontext( "/maven_build", new MavenBuildService( folder ) );
    server.createcontext( "/rezip", new RezipService( folder ) );
    server.createcontext( "/download", new Downloader( folder ) );
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


