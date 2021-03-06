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
    this.progressStep += 1;
    BufferedWriter responseWriter = null;
    try { 
      Map<String, String> params = this.bodyParams( e );
      Map<String, String> execute_params = new HashMap<String, String>( params );
      this.goHeaders( 200, e );
      this.preface += "<br>Running " + this.command();
      params.put( "__responseMode", "contentOnly" );
      this.handleGet( e, params );
      responseWriter = new BufferedWriter( new OutputStreamWriter( e.getResponseBody() ) );
      responseWriter.write( "<div id=process_output><pre><code>" );
      responseWriter.write( this.getHTML( "shared", "outputscroll.html" ) );
      this.execute( responseWriter, execute_params );
      responseWriter.write( "</code></pre></div>" );
      responseWriter.write( "<hr class=command_stop>" );
    } catch ( Exception ex ) {
      responseWriter.write( "An error occurred." );
      System.out.println( this.detailThrowable( ex ) );
    } catch ( Error er ) {
      responseWriter.write( "An error occurred." );
      System.out.println( this.detailThrowable( er ) );
    } finally {
      responseWriter.write( "</body></html>" );
      responseWriter.close();
      this.progressStep -= 1;
    }
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
  
  public String getPlatform() {
    String osName = System.getProperty( "os.name" );
    String platform = "unknown";
    if ( osName != null ) {
      String[] parts = osName.split( "\\s+" );
      String keyName = parts[ 0 ].toLowerCase();
      switch ( keyName ) {
        case "windows":
        case "mac":
        case "linux":
          platform = keyName;
          break;
        default:
          break;
      }
    }
    return platform;
  }

  public String getPlatformExtension( String platform ) {
    switch( platform ) {
      case "mac":
      case "linux":
      default:
        return "";
      case "windows":
        return ".cmd";
    }
  }

  public void execute( BufferedWriter writer, Map<String,String> parameters ) throws IOException {
    InputStream 
      stream = null,
      estream = null;
    try { 
      this.transformParameters( parameters );
      String platform = this.getPlatform();
      String platform_extension = this.getPlatformExtension( platform ); 
      Path target_dir = Paths.get( this.storageRoot() );
      Path command_dir = Paths.get( this.serviceBase, "service_scripts", platform, this.command() + platform_extension );
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
        stream = p.getInputStream();
        estream = p.getErrorStream();
        BufferedReader 
          reader = new BufferedReader( new InputStreamReader( stream ) ),
          ereader = new BufferedReader( new InputStreamReader( estream ) );
        String 
          line = null, 
          eline = null;
        while( ( ( line = reader.readLine() ) != null ) 
              || ( ( eline = ereader.readLine() ) != null ) ) {
          if ( line != null ) {
            writer.write( line + "\n" );
            writer.flush();
          } 
          if ( eline != null ) {
            writer.write( eline + "\n" );
            writer.flush();
          }
        }
      }
    } catch ( Exception ex ) {
      System.out.println( this.detailThrowable( ex ) );
    } catch ( Error er ) {
      System.out.println( this.detailThrowable( er ) );
    } finally {
      if ( stream != null ) {
        stream.close();
      }
    }
  }

}

