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

public class DezipService extends RuntimeService {

  public DezipService( String storageBase ) throws IOException {
    super( storageBase );
    this.progressStep = 3;
  }

  @Override
  protected String argPos() {
    return "zipfile taskguid options";
  }

  @Override
  public void transformParameters( Map<String,String> params ) {
    String guid = params.get( "taskguid" );
    Path unzipPath = Paths.get( this.storageRoot(), params.get( "taskguid" ) );
    params.put( "zipfile", "uploaded." + guid + ".zip" ); 
    params.put( "taskguid", unzipPath.toString() );
    params.put( "options", "-q" );
  }

  @Override
  protected String command() {
    return "dezip";
  }


}

