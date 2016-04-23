package com.dosaygo.app.jar_io.service;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import java.lang.ProcessBuilder;
import java.lang.Process;

import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.BufferedWriter;
import java.io.OutputStreamWriter;

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

  public void handlePost( HttpExchange e ) throws IOException {
    Map<String, String> params = this.bodyParams( e );
    Map<String, String> execute_params = new HashMap<String, String>( params );
    this.goHeaders( 200, e );
    params.put( "__responseMode", "contentOnly" );
    this.handleGet( e, params );
    BufferedWriter responseWriter = new BufferedWriter( new OutputStreamWriter( e.getResponseBody() ) );
    responseWriter.write( "<div id=process_output><pre><code>" );
    responseWriter.write( this.getHTML( "shared", "outputscroll.html" ) );
    this.execute( responseWriter, execute_params );
    responseWriter.write( "</code></pre>" );
    responseWriter.write( "</body></html>" );
    responseWriter.close();
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

  public void execute( BufferedWriter writer, Map<String,String> parameters ) throws IOException {
    this.transformParameters( parameters );
    String platform = "macosx";
    String platform_extension = "";
    Path target_dir = Paths.get( this.storageRoot() );
    Path command_dir = Paths.get( this.serviceBase, "service_scripts", platform, this.command() + platform_extension );
    try { 
      ProcessBuilder cmd = new ProcessBuilder( command_dir.toString() );
      if ( writer == null ) {
        cmd.inheritIO();
      }
      Files.createDirectories( target_dir );
      cmd.directory( target_dir.toFile() );
      List<String> command_args = cmd.command();
      this.positionArguments( parameters, command_args );
      Process p = cmd.start();
      if ( writer != null ) {
        InputStream stream = p.getInputStream();
        BufferedReader reader = new BufferedReader( new InputStreamReader( stream ) );
        String line;
        while( ( line = reader.readLine() ) != null ) {
          writer.write( line + "\n" );
          writer.flush();
        }
        stream.close();
      }
    } catch ( Exception e ) {
      System.out.println( e.toString() );
    }
  }

}

