package com.dosaygo.app.service;

import java.util.List;
import java.util.Map;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.nio.file.Paths;

/**
 * Web Server request dispatcher
 *
 */

public class MavenBuildService extends RuntimeService {
  
  public MavenBuildService( String storageBase ) throws IOException {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "taskguid run-mvn-package";
  }

  @Override
  protected String command() {
    return "maven_build";
  }


}

