package com.dosaygo.app.jar-io.service;

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

public class RezipService extends RuntimeService {

  public RezipService( String storageBase ) throws IOException {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "taskguid zipbase";
  }

  @Override
  protected String command() {
    return "rezip";
  }

  @Override
  public void transformParameters( Map<String,String> params ) {
    String taskguid = params.get( "taskguid" );
    Path buildPath = Paths.get( this.storageRoot(), params.get( "taskguid" ) );
    params.put( "taskguid", buildPath.toString() );
    params.put( "zipbase", taskguid );
  }
}

