package com.dosaygo.app.service;

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

public class BuildService extends RuntimeService {

  public BuildService( String storageBase ) throws IOException {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "taskguid make_jar entrypoint";
  }

  @Override
  protected String command() {
    return "build";
  }

  @Override
  public void transformParameters( Map<String,String> params ) {
    Path buildPath = Paths.get( this.storageRoot(), params.get( "taskguid" ) );
    params.put( "taskguid", buildPath.toString() );
  }

}

