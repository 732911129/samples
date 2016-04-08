package com.example;

import java.util.Map;
import java.io.IOException;
import fi.iki.elonen.NanoHTTPD;

public class App extends NanoHTTPD {

    public App() throws IOException {
        super(8080);
        start();
        System.out.println( "\nRunning! Point your browers to http://localhost:8080/ \n" );
    }

    public static void main(String[] args) {
        try {
            new App();
        }
        catch( IOException ioe ) {
            System.err.println( "Couldn't start server:\n" + ioe );
        }
    }

    @Override
    public Response serve(IHTTPSession session) {
        String msg = "<html><body><h1>Hello server</h1>\n";
        Map<String, String> parms = session.getParms();
        if (parms.get("username") == null) {
            msg += "<form action='?' method='get'>\n  <p>Your name: <input type='text' name='username'></p>\n" + "</form>\n";
        } else {
            msg += "<p>Hello, " + parms.get("username") + "!</p>";
        }
        return newFixedLengthResponse( msg + "</body></html>\n" );
    }
}