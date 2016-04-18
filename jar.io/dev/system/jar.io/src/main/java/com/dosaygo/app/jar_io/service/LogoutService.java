package com.dosaygo.app.jar_io.service;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

import java.lang.ProcessBuilder;

import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import java.nio.file.Paths;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

/**
 * Web Server request dispatcher
 *
 */

public class LogoutService extends Service {

  public LogoutService( String storageBase ) throws IOException {
    super( storageBase );
  }

  public void handlePost( HttpExchange e ) throws IOException {
    this.handleGet( e );
  }

}

