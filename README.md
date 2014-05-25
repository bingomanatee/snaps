# SNAPS ("synapse")

This is an attempt to create a semantic model of property storage and update. The idea being that you can have a
graph of data in which inheritance communicates change to the elements which are outward facing through an arbitrary
organization of elements.

## Change broadcasting / inheritance

The idea is that when you change a property, that change is propogated down through the chain until a property with an
override is found. This effects inheritance modelling

## Generic relationship model

Snaps can have multiple, deep tree relationship.
This is handy for instance if you want to have wolf snaps watching sheep snaps.

# Why SNAPS?

This is a response to the modelling in Famo.us; Famo.us's modelling is very literal and obfuscated; each
property is modelled with a custom, dirtified property and this makes state tracking and changing messy and
difficult to follow.

Also fundamental concepts like removing nodes is left out making basic activity very difficult to replicate.

Lastly, I wanted a situation in which some operations of a network can be exported to web workers, networked
processes, etc., with the results of updates being exported in a complete set to the rendering layer.

Most importantly, I wanted to capture a set of behaviors whose coincidence is very common --
relationships, inheritance, and state changes --
in a module that could be used in multiple contexts.

# Base Framework

The framework for Snaps is the creation of a Space that manages one or more Snaps instances. Each Snap may have one or more
child Snaps that inherit their settings.

## The Property Setting Cycle

Each Snap has a `get(prop)` and `set(prop, value)` method. However set properties don't immediately register; instead,
they are kept in a change buffer until one of two things happen:

1. The Snap's 'update(broadcast)` is called and the Snap (and if brodcast is true, its descendents) is loaded with all
the pending updates

2. the Snap's Space's `update()` method is called and all its Snaps are updated en masse.

## Observers

Snaps may have watchers that observe updates to the Snap. A snap's Observers' handlers are called under one of the following
conditions whenever its' update method is called:

1. if the Observer has a list of watched properties, and one of them is changed
2. if the Observer has no watched properties it is applied whenever ANY of its properties change
3. if the Observer has a time window, it is applied every update that the Snap's Space's time is within its time gate.

## Relationships

Snaps have relationship joiners, called Rel's; at the most basic, they point towards the parents or children of a Snap.
However they can be used to establish any other sort of relationships between Snaps.

## Output

Snaps can have none, one, or many outputs that watch the Snaps and recieve the changeset every time the surface is updated.
In this way they can affect DOM elements, canvas objects (Easel, etc.,) THREE scenes, etc.

Snaps is designed to be able to run in Web Workers and transmit its changeset through messages. It also allows for
remote management through pubsub models, web sockets, and other network/service enabled environments.

## Compatibility

### Browser

As the interaction with the DOM is fundamentally simple -- setting style properties, ids, name, etc., Snaps should
be cross browser compatibile to IE8 and all modern browsers. That being said, formal cross browser testing is pending.
Also, transforms are an IE9 festure so you will have to be consious of this when you use them.

### Other frameworks

Snaps only understands the DOM elements it creates / is passed; it should be interoperable with any other JS
framework. It works with require.js, and in fact can be used to manage properties in any JS system (THREE,
CreateJS, etc.). Like D3, its management system is independent of its rendering engine so it can be used to manage
any sort of property driven context.