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

public class DezipService extends RuntimeService {

  @Override;
  protected String argPos() {
    return "zipfile taskguid";
  }

  @Override;
  protected String getCommand() {
    return "dezip";
  }


}

