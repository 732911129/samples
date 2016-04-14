package com.dosaygo.app.service;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

import java.lang.ProcessBuilder;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.nio.file.Paths;

/**
 * Web Server request dispatcher
 *
 */

public class CopyService extends RuntimeService {

  public CopyService( String storageBase ) throws IOException {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "taskguid service1name service2name";
  }

  @Override
  protected String command() {
    return "copynode";
  }

  @Override
  public void transformParameters( Map<String,String> params ) {
    List<String> l = new ArrayList<String>( Arrays.asList( "service1name", "service2name" ) );
    l.forEach( key -> params.put( key, this.getStoragePath( params.get( key ) ) ) );
  }

}

