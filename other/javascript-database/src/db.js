"use strict";
// network health
const
  TEST = true;
{
  function no_internet() {
    if ( TEST ) return true;
    // actual imlementation
  }

  self.no_internet = no_internet;
}
// intercept
{
  function intercept_submission( form_el ) {
    form_el.addEventListener( 'submit', intercepter );
  }

  function intercepter( submit_event ) {
    if( no_internet() ) {

    }
  }

  self.intercept_submission = intercept_submission;
}
