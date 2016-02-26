# Development Progress 

This file tracks design, implementation, test and bugs discussion for feature-request-sample.

## Design Sketches

The description is well specified, since they provide a clear target data structure.

Idea is just to build:

- a view for this data structure
- a summary view for this data structure
- and some support structures such as:
 - collection view
 - search view
- a simple server with a single API endpoint ( for the data structure given )
- possibly, some different CSS skins for the app

## Requirements of this App

- JavaScript ( for resizing embedded content )
- Flexbox ( for layout )

## I would like

- To do a version that does not require JS.
- And a version that does not use Flexbox, to support older or device specific or embedded browsers.

## Clarifications

### Client Data Field

- Can we have multiple clients?
  - Assuming, no, because generally feature requests will be made by one client.
  - However, like the "star" feature of issues in many bug systems, often different customers will desire the same features, and tracking who and how many is one way to guage importance. 
  - In this case, tho, providing paid SaaS, the economics are slightly reversed, so that almost *any* feature request by a client works to be honoured, and often, each client receives a separate version of the application tailored for them, so that, the utility of aggregating to both track feature importance and ship features into a single product is not a requirement, while, handling separate products, and tracking the importance of features within those client products, is important.

### Product Area Data Field

- Can we have multiple product areas?
  - Yes, since there can be features that contain cross-cutting concerns affecting multiple product areas. One example is, "we want bigger fonts in the application". 

### Title Field validation

- Does it work to add a pattern validation to the title field?
  - Yes, since input validation is a very important step to keeping data orderly and useful. This is easiest at the source, where the work can be distributed to the humans at the point of data entry. Currently, titles are considered "good" if they span between 3 and 60 characters.

### Product Area Implementation

- What's a useful way to implement the input for product ares which could be a single or a list?
  - After considering checkbox, select and input, the results are as follows. Checkbox is discouraged because it is verbose ( one input and label per value ), and it does not readily provide a way to have that input be required. Select is discouraged because it does not readily provide a way to have the input be both required and allow for it to be more than one option at a time. A text input with a validating pattern is selected as the implementation because this permits a list of options, or a single option, to be entered, validated against the given set of possibilities, and for at least one entry from this list to be required in order for the input to validate. 
 
### Client List Data Source

- All of the fields in this form validate against static data. Does this work?
  - Mostly this works, with the exception of the client list. The humans may be gaining and losing clients at any time, and so it works to be able to update this list independent ( and in one location separate to ) the places where such a list of clients may be used across the humans' softwares. So it work to have a data source for this list of clients. 
  - Currently the list of clients is hard coded with what we can assume are "dummy", or perhaps "secret code" values. "Client A", "Client B", etc. ( At least it's not like the Bank's who notoriously call their clients all kinds of rude names. ) 
  - A TODO is to implement a data source for the clients and load this into the features form. Instead of doing this via a server side template ( which would then diminish the advantage we have from serving the feature.html document statically, we can pull such a list in from an API using script and load it dynamically on the client at the time of load ). The script option also lets us differentiate the use cases of the feature document from when it is being used to input a new feature ( the list of clients is required ), to when it is being used to display an already created feature. 

### Optional Fields

- The fields listed in the specification are the required fields. Does it works to include some additional fields which are optional, and what might they be?
  - Yes, I believe it does. Some additional fields might be:
    - The contact person at the client who called in the feature. 
      - It is often useful to not just know what is request, and also to understand who requested it. 
    - The contact person's role at the client, or role with regard to this project.
    - The interaction notes, if any. 
    - The human who input the feature report. 
    - An internal priority assigned to the feature by the company. 
- What are some matters related to adding optional fields? 
  - Pros:
    - Allows a somewhat experimental approach to the extension of the data structure. 
    - Provide some "slack" fields to give human's a chance to express additional things, which may not fit into any existing required categories. This has two benefits:
      - Evolve the data structure by human input, additional, loosely structure content, may, over time, provide clear insights about what new required fields could work to include. 
      - Increase reliability of existing required fields, by providing additional space to add more information, so that existing required fields are not "overloaded" ( and therefore vulnerable to having their information content integrity corrupted ) by attempts to "somehow fit" additional information into the existing schema, which in some cases, may be found to be too limited in scope or extent.
  - Cons:
    - Open the doors to chaos, and allow the focus of high quality information reporting to shift away from the useful and structured fields, and overlfow into the nascient fields of as-yet-uncertain structure. 
    - No obvious mitigation for this. It could be offset by the provision of "slack" structure which actually reinforces the integiry of existing structure by providing a dedicated space for overflow and the expression of possible new field requirements, or it could not be offset by this. I think, in this case, an experiment is the way to resolve the question of, "Does this introduce more chaos or more order to the system?"
    - Annoy the original designers of the specification, "But I did it this way and that was the best way to do it! How dare you suggest I was not totally amazing!" 
      - Mitigate by suggesting that it's not about "right" and "wrong", simply about acknowledging that we can always make improvements, and maybe this is one way to create some improvements. 
    - Smaller is better. Smaller is more organized. 
    - A large form can be off putting for humans, which could decrease motivation and effiency of feature reporting. Reducing the joy of feature reporting is never something that works. 
      - Mitigated possibly by putting the 'additional informations' section under a hidden drop down. 
- Decision is as follows. Additional fields will be added under an additional informations hidden section. 


## Form Structure

Ideas for improvements:

- Let's structure the form using some fieldsets, and see how they affect the semantics, layout and comprehensibility. 

## Component Resizing

Ideas for improvements:

- DONE - bugs fixed
  - DONE - trigger resize on textarea change size. 
    - Currently done using mouseup. This is somewhat wasteful as it triggers on every click. 
    - However, it also works, and it's not that wasteful ( not as wasteful as say, mousemove ).
  - DONE - if we resize a textarea, the component correctly becomes larger to accommodate it. however, if we then shrink the textarea, the component does not shrink with it. this is incorrect. 
    - [ SOLVED ] - setting the width of :root in the embedded document to width: fit-content solves this. 
    - [ SOLVED ] - setting dispaly: table solves this ( in a cross browser way to size a box to fit its content. 

- handle these interesting bugs:
  - if a mouse is connected a scrollbar appears on the embedded document. And is then removed, then reappears. 
  - if dimensions of embedder are intrinsically sized ( min, max or fit -content ), then scrollbars appear on the content or embedder, and yet the script does not detect these. this is incorrect.
  - the same undetectable scrollbars occur if overflow, of the embedder, is set to hidden. this is incorrect. 
  - fascinating bug in firefox where the embedding object keeps expanding. The calculations used for the width, which work so well in Chrome, are likely the cause of this bug in Firefox.

## Form Interaction:

Ideas for improvements:

- trigger display of the explainer tooltip on hover, or perhasp on clicking a '?' icon next to the input.

