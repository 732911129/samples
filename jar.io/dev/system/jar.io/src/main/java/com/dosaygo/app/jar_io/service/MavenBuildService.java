package com.dosaygo.app.jar_io.service;

import java.util.List;
import java.util.Map;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.nio.file.Paths;
import java.nio.file.Path;

/**
 * Web Server request dispatcher
 *
 */

public class MavenBuildService extends RuntimeService {
  
  public MavenBuildService( String storageBase ) throws IOException {
    super( storageBase );
    this.progressStep = 5;
  }

  @Override
  protected String argPos() {
    return "taskguid run_package";
  }

  @Override
  protected String command() {
    return "maven_build";
  }

  @Override
  public void transformParameters( Map<String,String> params ) {
    Path buildPath = Paths.get( this.storageRoot(), params.get( "taskguid" ) );
    params.put( "taskguid", buildPath.toString() );
  }

}

