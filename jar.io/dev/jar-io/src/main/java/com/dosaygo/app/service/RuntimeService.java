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
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Web Server request dispatcher
 *
 */

abstract public class RuntimeService extends Service {

  protected Map<String,Integer> arg_order;

  abstract protected String command();
  abstract protected String argPos();

  public RuntimeService( String storageBase ) throws IOException {
    super( storageBase );
    this.arg_order = new HashMap<String,Integer>();
    String[] pos = this.argPos().split( " " );
    for( int i = 0; i < pos.length; i++ ) {
      this.arg_order.put( pos[ i ], i + 1 );
    }
  }

  @Override
  protected String storageRoot() {
    return Paths.get( this.storageBase, "jar-io", "tmp", this.name() + "-" + this.command() + "-scratchdisk" ).toAbsolutePath().toString();
  }

  public void handlePost( HttpExchange e ) throws IOException {
    String body = this.streamToString( e.getRequestBody() );
    Map<String, String> params = this.queryToMap( body );
    this.execute( params );
  }

  private void positionArguments( Map<String,String> arg_map, List<String> args ) {
    arg_map.entrySet().forEach( arg -> { 
      if( this.arg_order.containsKey( arg.getKey() ) ) {
        int index = this.arg_order.get( arg.getKey() );
        while( index > args.size() ) {
          args.add( " " );
        }
        if( index == args.size() ) {
          args.add( arg.getValue() );
        } else { 
          args.set( index, arg.getValue() );
        }
      }
    } );
  }

  public void execute( Map<String,String> parameters ) throws IOException {
    System.out.println( parameters.toString() );
    this.transformParameters( parameters );
    String platform = "macosx";
    String platform_extension = "";
    Path target_dir = Paths.get( this.storageRoot() );
    Path command_dir = Paths.get( this.serviceBase, "service_scripts", platform, this.command() + platform_extension );
    try { 
      ProcessBuilder cmd = new ProcessBuilder( command_dir.toString() );
      Files.createDirectories( target_dir );
      cmd.directory( target_dir.toFile() );
      List<String> command_args = cmd.command();
      this.positionArguments( parameters, command_args );
      cmd.start();
    } catch ( Exception e ) {
      System.out.println( e.toString() );
    }
  }

}

