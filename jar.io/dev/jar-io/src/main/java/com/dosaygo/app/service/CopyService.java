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

  public void copy( node, service1, service2 ) {
    // simply executes a cp -r {service1 root}/node {service2 root}/node
    //
  }
}

