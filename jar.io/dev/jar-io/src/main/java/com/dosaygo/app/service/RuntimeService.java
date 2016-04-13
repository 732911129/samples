package com.dosaygo.app.service;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import java.lang.ProcessBuilder;

import java.io.IOException;
import java.io.OutputStream;

import java.nio.file.Paths;
import java.nio.file.Path;

/**
 * Web Server request dispatcher
 *
 */

abstract public class RuntimeService extends Service {

  protected Map<String,Integer> arg_order;

  abstract protected String command();
  abstract protected String argPos();

  public RuntimeService( String storageBase ) {
    super( storageBase );
    this.arg_order = new HashMap<String,Integer>();
    String[] pos = this.argPos().split( " " );
    for( int i = 0; i < pos.length; i++ ) {
      this.arg_order.put( pos[ i ], i + 1 );
    }
  }

  @Override
  protected String name() {
    return "RuntimeService";
  }

  @Override
  protected String storageRoot() {
    return this.name() + "-" + this.command() + "-scratchdisk";
  }

  public void handleGet( HttpExchange e ) throws IOException {
    String response = "<form method=POST action=/" + this.command() + "><input name=guid><button>" + this.command() + "</button></form>";
    Headers h = e.getResponseHeaders(); 
    h.set( "Content-Type", "text/html; charset=utf-8" );
    e.sendResponseHeaders( 200, response.length() );
    OutputStream os = e.getResponseBody();
    os.write( response.getBytes() );
    os.close();
  }

  public void handlePost( HttpExchange e ) throws IOException {
    String body = this.streamToString( e.getRequestBody() );
    Map<String, String> params = this.queryToMap( body );
    this.execute( params );
  }

  private void positionArguments( Map<String,String> arg_map, List<String> args ) {
    arg_map.entrySet().forEach( arg -> { 
      if( this.arg_order.containsKey( arg.getKey() ) ) {
        args.set( this.arg_order.get( arg.getKey() ), arg.getValue() );
      }
    } );
  }

  public void execute( Map<String,String> parameters ) throws IOException {
    String nodeName = parameters.get( "nodeName" );
    String platform = "macosx";
    String platform_extension = "";
    Path target_dir = Paths.get( this.storageRoot(), nodeName );
    Path command_dir = Paths.get( this.storageBase, "service_scripts", platform, this.command(), platform_extension );
    ProcessBuilder cmd = new ProcessBuilder( command_dir.toString() );
    cmd.directory( target_dir.toFile() );
    List<String> command_args = cmd.command();
    this.positionArguments( parameters, command_args );
    cmd.start();
  }

}

