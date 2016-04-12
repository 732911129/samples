package com.dosaygo.app.service;

import java.util.List;
import java.util.Map;

import java.lang.ProcessBuilder;

import java.io.IOException;

import java.nio.file.Paths;

/**
 * Web Server request dispatcher
 *
 */

abstract public class RuntimeService extends Service {

  private Map<String,Int> arg_order;

  abstract protected String command();
  abstract protected String argPos();

  public RuntimeService( ) {
    String[] pos = this.argPos().split( ' ' );
    for( int i = 0; i < pos.length; i++ ) {
      arg_order.set( pos[ i ], i + 1 );
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

  private void positionArguments( Map<String,String> arg_map, List<String> args ) {
    arg_map.entrySet().forEach( arg -> { 
      if( arg_order.has( arg.getKey() ) ) {
        args[ this.arg_order[ arg.getKey() ] ] = arg.getValue();
      }
    } );
  }

  public void execute( Map<String,String> parameters ) {
    String nodeName = parameters.get( 'nodeName' );
    Path dir = Paths.get( this.storageRoot(), nodeName );
    Process cmd = new ProcessBuilder( this.command() );
    cmd.directory( dir );
    List<String> command_args = cmd.command();
    this.positionArguments( parameters, command_args );
    cmd.start();
  }

}

