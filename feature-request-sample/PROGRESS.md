# Development Progress 

  This file tracks design, implementation, test and bugs discussion for feature-request-sample.

## How to improve ?

Ideas for future:

  - Incorporate link stylesheet rewriting to inline the css. Do this before the view cache. 
  - Incorporate boilerplate ( document head ) rewriting to allow a basic framework for all views. Do this before the view cache.
  - Optimize cache expiry timings ( perhaps using versioned URLs ). 

## Progress Update

  - A lot more completed.
  - Viewes and templating are sketched in rough versions.
  - Tested on Windows and Mac, works in Chrome.
  - Edge has issue with resizing, and sizing of stand alone feature. 

## Todo from Monday

  - Finish for this week.
  - Implement back end. 
  - Render HTML on server using minidom. 
  - Update styles so that it can work with no javascript. 
  - Update markup so it can work with no or minimal HTML.

### More details from previous todo 

  - Begin to write back/api.py
    - Models can be defined from a HTML file like feature.html
    - The end points are:
      1. /model/type/feature/id/<id>
        - A specific instance
      2. /model/type/feature/role/<role>
        - role = detail-definition - The blank feature.html definition.
        - role = summary-definition - An as yet to be written summary view.
        - role = collection - The blank features.html definition.
      3. /model/type/feature
        - All
    - The instances are returned as HTML documents. 
      - The content type is text/html
      - XMLHttpRequest.response is type document
    - The rendering algorithm for documents returned from the specific instance end point is:
      1. Obtain the blank definition.
      2. Parse it into a HTML tree.
      3. Obtain the model instance.
      4. Walk over the tree filling each named slot with the corresponding values from the model.
      5. Serve the string representation of the processed HTML as the response.
    - The rendering algorithm for documents returned from the collection endpoint is:
      1. Obtain the collections blank definition.
      2. Parse it into a HTML tree.
      2. Obtain the paged set of key only results containing the instances ( summary role ) ids.
      4. For each instance id in the result, insert an object element with its data attribute set to the URI for the summary role document of the instance with that idm, wrap that object element in a list item element, and insert it into the list.
      5. Return the string version of the processed HTML tree as the response for the endpoint.
  - Sketch of how to use parsing:
    - We disallow any source HTML containing <!ENTITY since this can lead to malicious entity reference expansion.
    - We use xml.dom.minidom.parseString to create a document.
    - We walk the document ( just using a stack and childNodes ).
    - At each node if there is a modification it works to do perform, it is performed.
    - Once the tree is walked, the document's toxml method is called and the string produced is written to the response.

## Todo Sunday

  - Embedding tags are responsive.
    - Strategy:
      - Minimum dimensions are set by current algorithm for content.
      - Tags can resize larger than this based on space available on page.
      - This change to one or both dimensions being larger can adjust the layout of the content inside the embedding tag. 
      - It seems that with this two party negotiation for the size of the embedding tag, it works to have two stages, or two turns. 
      - The algorithm is sketched as:
        - First the page makes some space available for the embedding tag.
        - The embedding tag sizes itself to occupy this space.
        - The content then determine's its own size and requests the embedding tag to change size.
        - The embedding tag changes size. The content is fit. 
        - The page agjusts ( flows ) its own layout to the size of the embedding tag. 
    - Implementation:
      - Let's try to add responsive sizing to the embedding tag.
        - [ DONE ]
      - Let's set the sizes calculated for the embedding tag as the minimum dimensions rather than the attribute dimensions.
        - [ DONE ]
      - Let's add another step to the size negotiation that then, if the embedded content does not require ( utilize ) the extra space, we also set the attribute dimensions to those calculated. 
        - [ SESSION 1 ] 
          - [ NOTES ]
            - How do we determine if the embedded content utilizes the space ? 
              - I think we can check if we expand the documentElement to fill the given space, if the body element also expands. If it does, the space is utilized. If it does not, the space is not utilized. 
            - How do we make the resize function actually happen in steps?
              - Some ideas:
                - Between each step it is necessary to yield to the browser, so that any layout can be performed. Since we are not aiming for most advanced ES target, we can implement this using set timeouts. 
                - The resize function can in fact be the function which co-ordinates the sub steps in this size negotation algorithm. Something like:
                  1. Let next_step be a function that closes over an index, and an array of function each of which is a step in the resize algorithm. 
                  2. Step the index to 0.
                  3. Let next_step perform the following tasks:
                    1. Run the step corresponding to the function at the current index of the array.
                    2. Set a timeout to call next_step.
                    3. Increment the index.
                    4. Return. 
                  4. Run next_step.
                  5. Return.
                - Okay some ideas:
                  - It works to use the tasks and data flow like functions I wrote for another sample work here. 
                  - It works to simplify the content resizing algorithm. 
          - [ NOTES ]
            - The proposed algorithms can produce reflow loops. 
            - This is okay, since we can just halt them after counting the number of times we reflowed. 
            - The worst case is we just expand the containing page ( or any other containrs with 'expand-into-scroll' set ), until there is enough space. 
          - [ What is the point of this ? ] 
            - The point is that we can roughly specify a type of layout, using embedded content like custom elements, or objects, and have everything size tiself so that it is displayed as we would like, even if this means changing the layout in some way, or expanding into the size of containers that have 'expand into scroll' set. 
            - The whole point is we don't really have to think about layout any more. We just know that we want these components on screen, with these rough placing between them, and we don't really care where everything goes so long as it basically fits the dimensions of the screen we are on. And we don't have scrollbars on or hidden parts of components where we don't want them. 
            - Having layout be flexible and not having to worry about it really works. 
        - [ SESSION 2 ] 
          - How to determine if the embedded content will use the new space assigned to it?
            - An idea:
              - Set the embedded content's document to the dimensions of the space offered to the embedding tag, and if the embedded content uses the space ( the component resizes in some way ), then update the embedding tag's dimensions to match the component's. 
          - What's the aim of this? 
            - The aim is to be able to display a functioning site on any device, using any browser.
            - There's a whole lot of primitives we can build that use only basic JavaScript, and no flexbox. And so we want to start at a very simple, direct and straight forward base using those, and provide the options to upgrade if we have the capability as well.
            - Do as much as possible as simply and directly as possible without using flexbox or JavaScript. 
            - Basically the way to build a component is to build it as a stand alone, and then it can display okay over a range of sizes, and then it is a workable component. 

  - Notes on Components
    - [ NOTES ]
      - Components work to be designed as cards, that can adjust layout based on the size of their containers. 
      - In the most basic case all components are simply displayed as cards, left to right ( if there is sufficient width ), and down the page. 
      - In more involved cases, the components have specific position in relation to each other, or in relation to the screen or both. 
      - The most basic case is there is no javascript, and no custom styling. In this case, it's not so important that components look amazing ( since there are no custom stylings ), simply that they are available, and display without error. 

## Progress overview 

  - a50c727
    - Working in FF Nightly ( 47 )
    - Working in Chrome Beta and up ( 49 + )

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

  - handle these interesting bugs:
    - ALL DONE - first set
    - after adding some styling to feature.html, scrollbars appear in Chrome after the details section is expanded and then contracted. 

  - DONE - bugs fixed
    - DONE - fascinating bug in firefox where the embedding object keeps expanding. The calculations used for the width, which work so well in Chrome, are likely the cause of this bug in Firefox.
      - [ NOTES ] - In work on the other bugs, it appears this one has ceased to have effect.
      - [ SOLVED ] 
    - DONE - when a mouse is connected, a scroll bar appears on the embedded content. And it seems that the calculated size of the embedder is incorrect, and possibly that this scroll bar is not detected. This is incorrect. If a scrollbar is to appear, then it works to detect it. Or perhaps there is a way to prevent a scrollbar appearing in embedded content, even when a mouse is connected. Correction: this bug appears now in chrome whether a mouse is connected or not. The scrollbar appears to be inserted on the embedding object tag.  
      - [ UPDATE ] - removing the scrollbar tests from embedded dimensions calculation has appeared to remove this bug.
      - [ NOTES ] - In work on the other bugs, it appears this one has ceased to have effect. 
      - [ SOLVED ] 
    - DONE - scroll bars around embedding tag persist in firefox. This appears to be because the border if any of the embedding tag is not being added to the embedding tag's dimensions. 
      - [ EXPERIMENT ] - try styling embedding tag with box-sizing:border-box. 
        - [ RESULT ] - now the scroll bars persist in both chrome and firefox. What appears to be happening is the border and then the scroll bars are taking up space in the content zone. 
      - [ EXPERIMENT ] - try capturing the border style if any of the embedding tag and applying it to the embedding tag's dimensions. 
        - [ RESULT ] - this works to remove the scroll bars and now there is a little gap between the embedding tag and it's content. It may work to further create an improvement in the calculation of the correct size of the embedding tag. 
      - [ SOLVED ]  
    - DONE - In firefox the scroll height is equal to the size of the embedded, even when the document content is shorter than this. This leaves the calculated content height, and therefore the size of the embedder too tall. This bug is likely because we incorrectly calculated the content height based on the scroll height and not on the height of the documentElement ( that is the client height ). Corrected this.
      - [ UPDATE ] - correct content height to be calculated on client height, removes this bug in Firefox. 
      - [ SOLVED ]
    - DONE - In firefox the width of the document element will not collapse to fit it's contents even tho display table or width fit content are set.
      - [ SOLVED ] - styling :root with width: min-content works to achieve the embedded content's document element fitting its content in both firefox and chrome.
    - DONE - the same undetectable scrollbars occur if overflow, of the embedder, is set to hidden. this is incorrect. 
      - [ UNNECESSARY ] - no need to set overflow on embedding tag. 
    - DONE - if dimensions of embedder are intrinsically sized ( min, max or fit -content ), then scrollbars appear on the content or embedder, and yet the script does not detect these. this is incorrect.
      - [ UNNECESSARY ] - contributing reason : no need to size embedding tag intrinsically. 
    - DONE - if a mouse is connected a scrollbar appears on the embedded document. And is then removed, then reappears. 
      - [ SOLVED ] - remove the resize handler from the window 'resize' event.
    - DONE - trigger resize on textarea change size. 
      - Currently done using mouseup. This is somewhat wasteful as it triggers on every click. 
      - However, it also works, and it's not that wasteful ( not as wasteful as say, mousemove ).
    - DONE - if we resize a textarea, the component correctly becomes larger to accommodate it. however, if we then shrink the textarea, the component does not shrink with it. this is incorrect. 
      - [ SOLVED ] - setting the width of :root in the embedded document to width: fit-content solves this. 
      - [ SOLVED ] - setting dispaly: table solves this ( in a cross browser way to size a box to fit its content. 

## Form Interaction:

  Ideas for improvements:

  - trigger display of the explainer tooltip on hover, or perhasp on clicking a '?' icon next to the input.

