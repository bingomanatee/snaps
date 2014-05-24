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