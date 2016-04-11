package com.dosaygo.app.service;

import java.util.List;

import java.lang.ProcessBuilder;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.nio.file.Paths;

/**
 * Web Server request dispatcher
 *
 */

abstract public class RuntimeService extends Service {

  private String storageRoot;
  private String command;

  public RuntimeService( String command, String storageRoot ) {
    this.command = command;
    this.storageRoot = storageRoot;
  }

  public String getStorageRoot() {
    return this.storageRoot;
  }

  abstract private void personalizeArguments( List<String> args );

  public void executeCommandOnStorageNode( String nodeName ) {
    Path dir = Paths.get( this.storageRoot, nodeName );
    Process cmd = new ProcessBuilder( this.command );
    cmd.directory( dir );
    List<String> command = cmd.command();
    this.personalizeArguments( command );
    cmd.start();
  }

}

