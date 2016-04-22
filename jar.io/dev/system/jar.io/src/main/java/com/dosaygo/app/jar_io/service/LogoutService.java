package com.dosaygo.app.jar_io.service;

import com.dosaygo.data.cavedb.App.CaveHumanAPI;
import com.dosaygo.data.cavedb.App.CaveObject;

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

  public final CaveHumanAPI humans;
  
  public LogoutService( String storageBase ) throws IOException {
    super( storageBase );
    this.humans = new CaveHumanAPI( "." );
  }

  public void handlePost( HttpExchange e ) throws IOException {
    this.inCookies.forEach( ( key, value ) -> System.out.println( key + "=" + value ) );
    String sessionId = this.inCookies.get( "JARIOSESSION" );
    if ( sessionId != null ) {
      CaveObject sessionObject = this.humans.objects.db.getObject( sessionId );
      sessionObject.raw = "LOGGED OUT".getBytes();
      this.humans.objects.db.saveObject( sessionObject );
      this.preface = "LOGGED OUT";
    } else {
      this.preface = "NOT LOGGED IN";
    }
    this.handleGet( e );
  }

}



