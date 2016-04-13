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

public class RezipService extends RuntimeService {

  public RezipService( String storageBase ) {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "taskguid";
  }

  @Override
  protected String command() {
    return "rezip";
  }

}

