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

public class DezipService extends RuntimeService {

  public DezipService( String storageBase ) throws IOException {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "zipfile taskguid options";
  }

  @Override
  public void transformParameters( Map<String,String> params ) {
    Path unzipPath = Paths.get( this.storageRoot(), params.get( "taskguid" ) );
    params.put( "taskguid", unzipPath.toString() );
    params.put( "options", "-q" );
    System.out.println( params );
  }

  @Override
  protected String command() {
    return "dezip";
  }


}

