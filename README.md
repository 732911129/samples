# what is this?

Sample work making a feature request component.

## how to get it?

`git clone https://github.com/dosaygo/feature-request-sample.git`

## how to run it locally?

1. Install gcloud.
  1. `curl https://sdk.cloud.google.com | bash`
  2. Restart your terminal shell.
  3. `gcloud init`
  4. `gcloud components install app-engine-python`

2. Run:

  - `cd feature-request-sample`
  - `dev_appserver.py ./`

3. It will be live at:

  [http://localhost:8080/](http://localhost:8080/)

## how to run it in online ?

1. Install gcloud if you haven't already:
  1. `curl https://sdk.cloud.google.com | bash`
  2. Restart your terminal shell.
  3. `gcloud init`
  4. `gcloud components install app-engine-python`

2. Run:

  - `cd feature-request-sample`
  - `gcloud preview app deploy ./app.yaml --version 1-0 --promote`

3. It will be live at:

  https://feature-request-sample-dot-YOUR-PROJECT.appspot.com/


  
 
  
  

