# SNAPS ("synapse")

This is an attempt to create a semantic model of property storage and update. The idea being that you can have a
graph of data in which inheritance communicates change to the elements which are outward facing through an arbitrary
organization of elements.

## Change broadcasting / inheritance

The idea is that when you change a property, that change is propogated down through the chain until a property with an
override is found. This effects inheritance modelling

## Semantic relationship model

Snaps can have multiple, deep relationships. Any sort of relationships can be created --

* node (parent/child)
* one to many (one id --> id collections)
* many to many (id collections)
* semantic (id --> annotation --> id)
* graph (id <-----> id)

This is handy for instance if you want to have wolf snaps watching sheep snaps or create collections of snaps.

# Why SNAPS?

SNAPS has a clear pattern of relationships using linked Snaps instances, and treats the problem of dirty properties
and property states using universal and consistent logic. It also draws a clear line between the event and property
system and the rendering method, making it very easy to extend Snaps' management system to any rendering system you please.
It allows for modifying and animating any and all properties of DOM elements and element styles putting you in complete
control of the rendered output.

I wanted a codebase in which some operations of a network can be exported to web workers, networked
processes, etc., with the results of updates being exported in a complete set to the rendering layer.

Most importantly, I wanted to capture a set of behaviors whose coincidence is very common --
relationships, inheritance, and state changes -- in a module that could be used in multiple contexts.

This is a response to the modelling in Famo.us; Famo.us's modelling is very literal and obfuscated with a lot of repeated
code; each property is considered a special case, managed with a unique, dirtified property
and this makes state tracking and changing messy and difficult to follow. Also testing is nonexistent.
Also fundamental concepts like removing nodes is left out making basic activity very difficult to replicate.

# Base Framework

The framework for Snaps is the creation of a Space that manages one or more Snaps instances. Each Snap may have one or more
child Snaps that inherit their settings. The relationships are managed by links, which can connect Snaps in any number of
patterns from semantic to parent/child to an open graph.

## The Property Setting Cycle

Property setting is buffered in able to synchronize all changes (and broadcast updates to ouptut) only once, after a set
of operations is completed.

Each Snap has a `get(prop)` and `set(prop, value)` method. However set properties don't immediately register; instead,
they are kept in a change buffer until one of two things happen:

1. The Snap's 'update(broadcast)` is called and the Snap (and if broadcast is true, its children) is loaded with all
the pending updates

2. the Snap's Space's `update()` method is called and all its Snaps are updated en masse.

Thus, snaps is an "eventual consistency" model in which transactions are cached at the snap level and locked in in parallel.

## Inheritance

When Snaps are linked by nodes into a parent child tree, any changes to a property are also written into its' child Snap properties.
However setting a Snaps' property directly protects it from inherited property changes. That is, you only inherit a property
if your property has not been directly set through `set(...)`. &ast;

The inheritance property reflects the inheritance style of CSS, where a DomElement's property reflects that of its parents
unless its value has been set to a specific value. (see example below)

## Observers

Snaps may have watchers that observe updates to the Snap. A snap's Observers' handlers are called under one of the following
conditions whenever its' update method is called:

1. if the Observer has a one or more watched properties, and one of them is changed
2. if the Observer has no watched properties it is applied whenever ANY of its properties change

## Blends/animation

A Snap's properties can be Blended. Blends affect a single property, bringing its numeric property from one value
to another. This blending is done during the update cycle in accordance to the space's time property.

Multiple blends for the same property combine based on their weighted value allowing for an eased transition between
contradictory blend directives. `mySnap.blend('height', 200, 50)` will blend the height property from its present
value (or zero if its not defined) to 200 over 50 milliseconds.

## Relationships

Snaps have relationship joiners, called Rel's; at the most basic, they point towards the parents or children of a Snap.
However they can be used to establish any other sort of relationships between Snaps.

## Output

Snaps can have none, one, or many outputs that watch the Snaps and recieve the changeset every time the surface is updated.
In this way they can affect DOM elements, canvas objects (Easel, etc.,) THREE scenes, etc.

Snaps is designed to be able to run in Web Workers and transmit its changeset through messages. It also allows for
remote management through pubsub models, web sockets, and other network/service enabled environments.

## Compatibility

### BrowserDom

The BrowserDom class is built on Snaps. It uses distinct snaps for elements, attributes, and data. BrowserDom
objects are not themselves snaps. (this may change).

BrowserDom has no innate abstractions -- you set style properties and attributes of DOM elements, and nest them.
It is designed to work in an unopiniated way with all the tools DOM has to offer, and to allow you complete access
to DOM.

However there are utilities that work with the BrowserDom such as the Box model to caluclate layouts based on
relative position, offsets, etc.

### Other frameworks

Snaps only understands the DOM elements it creates / is passed; it should be interoperable with any other JS
framework. It works with require.js, and in fact can be used to manage properties in any JS system (THREE,
CreateJS, etc.). Like D3, its management system is independent of its rendering engine so it can be used to manage
any sort of property driven context.

## Used and Grateful

I use the following dependent libraries to drive Snaps.

* **lodash** (loaded seperately) for some operations
* **check-types** (included) for type checking
* **Tween.js** (included) for easing functions
* **signals** (loaded seperately) for events
* **Grunt** (as a developer dependency) for building and keeping examples up to date
* **famous-generator** for building examples (and then I gut out the famo.us bits)
* **Mocha** for testing
* **WebStorm** (my IDE) for CI and general awesomeness (Grunt launching, test running).

-------------

Example: inheritance


### example

```
snap 1: {x: 1, y: 2} : _my_props: {x: 1, y: 2}
  child: snap 2 {x: 2, y: 2} :  _my_props: {x: 2}
     child: snap 3 {x: 2, y: 2}  : _my_props: {}
```
1. if snap 1.set(y, 3) is called, then the y value of the entire family is set to 3 through inheritance
2. if (snap1.set(x, 3) is called:

    * snap 1's x value is set (to update to) 3.
    * snap 2's x value stays at 2, as its x property has been set directly, in the past.
    * snap 3's x property is not changed, as the update signal never gets past its parent, Snap 2.

-------------
&ast; (this is because directly setting a property
      creates a memo in my_props which records when a Snap's property has been directly changed from the outside.)
