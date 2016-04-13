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

public class CopyService extends RuntimeService {

  public CopyService( String storageBase ) throws IOException {
    super( storageBase );
  }

  @Override
  protected String argPos() {
    return "node service1name service2name";
  }

  @Override
  protected String command() {
    return "copynode";
  }

  public void copy( String node, String service1, String service2 ) {
    // simply executes a cp -r {service1 root}/node {service2 root}/node
    //
  }
}

