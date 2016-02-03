# synced-contenteditable-demo
All edits and selection moves from a master contenteditable are distributed to slave contenteditables.

## Requirements

Chrome stable or above.

## How?

- Relevant events ( including selectionchange, textInput, keydown, beforecut and paste ) are captured at the contenteditable.
- These events are converted into edit events and emitted, by an [EditSensor](https://github.com/dosaygo/synced-contenteditable-demo/blob/master/libv2/EditSensor.js).
- These edit events can be injested by an [EditActor](https://github.com/dosaygo/synced-contenteditable-demo/blob/master/libv2/EditActor.js) and effected in its attached contenteditable. 

## Demo

[Demos for libv2 and libv3](https://www.dosaygo.com/simulatejs/examples.html)
