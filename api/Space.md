## SNAPS.Space

the Space instance is the central management class of a collection of Snaps. it is created through calling
the factory method (NOT constructor)

``` javascript

var space = SNAPS.space()

```

there are no arguments for `SNAPS.space()`. Spaces are primarily a collection of Snaps.

You can have any number of Space's in an application if you can find a useful reason to do so...

### Properties

#### start : int

the epoch time at which the space was created. It is the basis by which `nextTime()` computes relative time.

#### time : int

a relative value that starts from 0 and increments with `nextTime()`. It is this value that all the
system elements use to effect blends, etc.

#### snaps: array(Snaps)

a registry of all the spaces' Snaps. Use the method below to refer to individual Snaps or create or destroy them.

### Methods

#### Space.count() : int

the number of snaps in the space.

#### Space.resetTime() : void

sets the time and start properties to 0 and current time respectively. Called at construction time

#### Space.nextTime() : time

records the current system time into the Space, returning the relative time elapsed since start.


#### Space.addLink(id:int, link: Snaps.Link) : void

adds a link to a given snap; mainly an internal method.

#### Space.removeLink(link: Snaps.link) : void

removes a link from all referenced Snap's.

#### Space.snap(input : various) : Snap

This factory creates a new Snap and is the preferred way to create a new Snap.
Or, it returns a Snap based on its ID from the space.

overloaded:

 * with no arguments: returns a new Snap
 * if is a number(int): returns existing Snap by ID
 * if is true: returns a new "simple" Snap
 * if is object: returns a new Snap with a preset property list.

#### Space.hasSnap(Snap/id) : boolean

returns whether the snap is included in this space -- or if an id int is valid.
Good if you are using multiple spaces to validate membership of a given snap in a given space.

#### Space.bd(props : Object, ele: DomElement (optional), parent: DomElement | BrowserDom (optional) ) : BrowserDom

returns an new BrowserDom object. The props can be element or attribute values.
Note unless props.addElement == true, the returned BrowserDom's element is not automatically
inserted into the document.

#### Space.update() : void

updates all the snaps who have pending property changes.

#### SNAPS.space() : Space

returns a new space. Ordinarily you will call this once in the start of your app.