package com.dosaygo.app.jar_io.service;

import com.dosaygo.data.cavedb.App.CaveHumanAPI;
import com.dosaygo.data.cavedb.App.CaveObject;
import static com.dosaygo.data.cavedb.App.CaveObjectType.*;

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

public class LoginService extends Service {

  public final CaveHumanAPI humans;

  public LoginService( String storageBase ) throws IOException {
    super( storageBase );
    this.humans = new CaveHumanAPI( "." );
  }

  public void handlePost( HttpExchange e ) throws IOException {
    try { 
      Map<String, String> params = this.bodyParams( e );
      String handle = params.get( "handle" );
      String password = params.get( "password" );
      String create = params.get( "create" );
      boolean login = false;
      if ( create == null ) {
        if ( handle != null && password != null ) {
          login = this.humans.testHumanPassword( handle, password ); 
        }
      } else {
        // SECURITY: Check if human exists first.
          // And only if the human does not exist
          // create a new human and set login true.
          // Otherwise overwrite is possible. 
        String name = params.get( "name" );
        this.humans.newHuman( handle, name, password );
        login = true;
      }
      CaveObject sessionObject = new CaveObject( null, RAW, "".getBytes() );
      if ( login ) {
        // SECURITY : lovely insecure forgeable cookie
          // So deliciously insecure.
        sessionObject.raw = "LOGGED IN".getBytes();
        this.preface = "LOGGED IN! Hello, " + this.humans.getHumanFirstName( handle );
      } else {
        sessionObject.raw = "LOGGED OUT".getBytes();
        this.preface = "NOT LOGGED IN!";
      }
      String sessionId = this.humans.objects.db.saveObject( sessionObject );
      this.cookies.put( "JARIOSESSION", sessionId );
      this.handleGet( e );
    } catch ( Exception ex ) {
      System.out.println( this.detailThrowable ( ex ) );
    } catch ( Error er ) {
      System.out.println( this.detailThrowable ( er ) );
    }
  }

}

