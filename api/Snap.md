## Snap

Snap is the fundamental building block of SNAPS; it is short for Synapse, but functionally is closer to a Neuron.
Snap is a repository of data and is linkable to other Snaps through Links (see).

Snap properties are accessed through get() and set() methods. However setting a Snaps property
merely queues the Snap for a property update. Until the Snap is update()d, its properties reflect the state of the Snap
after the last update.

### Simple Snaps

There are cases where the update cycle is not productive and you want a stripped down Snap
which immediately reflects its updated values; this reduces the overhead of the update cycle
as the messages sent back and forth during the update cycle are significantly reduced.

setting a Snaps' simple to true in construction pre-empts a large number of the steps in
the Snaps' constructor. Because of this, a Simple snap cannot be the root of most links;
that is, it can be a node child, but not a node parent; it can be a semantic end Snap, but
not the initial snap. (In fact the meta snap of smeantic links is always simple.)
And a simple Snap does not have any signals, observers, etc; its sole activity is to record properties.

### The Update Cycle

When a snap is updated, one or more sub-actions is taken based on the Space's state:

1. any blends attached to the Space are executed.
2. any observers that refer to changed properties are triggered.
3. the properties' values with pending changes are set to their new values.
4. any properties marked for deletion are cleared
5. if the update method was called with broadcast its children are then updated.

### Properties (public)

#### receptors : Object

A collection of event listeners, which are [Signals](http://millermedeiros.github.io/js-signals/).
Currently listens for the update event, but can be used for any application centric event you
want to add. (except of course update...) *not present in simple Snaps.*

#### changeReceptors: Object

listens to changes to specific properties. Meant to mostly replace Obeservers.  *not present in simple Snaps.*

When a property is updated the changeReceptor signal with its name receives a dispatch
with the following signature:

1. the upcoming new value of the property. Can be any type of value (even null).
   Can be the SNAPS.DELETE object which is sent to properties to erase their reference.
2. the old (current) value of the property -- null if the property is being added.
3. a boolean, true if the property is being created.
4. a pending object that reflects all the current changes being undertaken.

#### lastChanged: Object

the last set of changes sent to the changeReceptors during the update phase.  *not present in simple Snaps.*

#### observers: array

A collection of observers watching for changes.  *not present in simple Snaps.*

#### links : array

A collection of links; includes any links that refer to this Snap. For instance node
links that connect parent and children are present in both the parent and child snap.
*not present in simple Snaps.*

#### active: boolean

whether or not a Snap has been destroyed -- set to true at construction

#### output : Object (optional)

a collection of listeners for output. Will soon be replaced with the main receptor.

#### $TYPE : string (== 'SNAP')

### Methods : core

#### Snap.destroy() : void

destroys the snap:

* removing the snap from any links it was once a member of (which destroys the link in most cases)
* deletes all the collections described above -- links, observers
* deletes event receptors -- receptors, changeReceptors, output

note - the snap is left in the space's space array for record keeping.

#### addOutput(listener : function){

adds a listener for output, creating an interface for taking data from select Snaps
to interface them to systems outside the Snaps system (or to BrowserDom objects).

### Methods : properties

#### Snap.has( prop: string, my: boolean (optional) ) : boolean

returns whether the Snap has a given property. If the second parameter is true, it returns true
only if the Snaps' property has been directly set (as opposed to being set thorugh inheritance.)

#### Snap.set( prop : string,  value: variant, immediate: boolean) : this (Snap)

queues a property to be changed upon the next update cycle.
if immediate is true, the value is updated directly.
note- during an update cycle, all `set()`'s are immediate.

Calls inherit recursively over the child node tree.

#### Snap.get (prop: string, pending: boolean) : variant

returns the current value of the Snap's property (or null if it doesn't exist). i
If pending is true, it will reflect any pending changes to the Snap (if there are any).

#### Snap.del(prop : string) : void

queues a property for deletion by setting it to a special object, SNAPS.DELETE.
In the update cycle, that property will be removed from the property list.

#### Snap.setAndUpdate(prop: string, value: variant) : this (Snap)

equivalent to `Snap.set(prop, value, true)`. Sugar for an immediate set that reflects instantly
for subsequent `get(prop)`'s.

#### Snap.merge(prop, value, combiner: function(optional)) : this(Snap)

merges object or array values for a given property with the current properties value;
i.e., a Snap with foo = [1, 2] after a call of `mySnap.merge([3, 4])` and `mySnap.update()`,
will have `mySnap.get('foo') == [1, 2, 3, 4]`.

This method defaults to `set(prop, value)` behavior if the types of the new value and the current value
do not match.

optionally, the combiner function can be used to functionally combine the old and new values.
This is equivalent of calling `mySnap.set(prop, combiner(value, mySnap.get(prop))`.

Note - merge ignores any pending value of the property, so if `mySnap.get('foo')` == [1, 2],
`mySnap.merge('foo', [3, 4]).merge([5,6]).update()` will result in `mySnap.get('foo')` == [1, 2, 5, 6],
not `mySnap.get('foo')` == [1, 2, 3, 4, 5, 6]. If you want to combine merges, use `mySnap.update()`
after each `merge(...)`.

#### Snap.state() : Object

serializes the current property set as an object.

### Methods : link, impulse

#### Snap.link (various) : Link

creates a new link, adding it to this and other linked Snaps' links collections.

* mySnap.link(snap | int)

creates a 'node' Snap, with this snap as the parent and the
passed-in snap as the child. its meta will be 'nodeChild'.

* mySnap.link('semantic', snap | int) or
* mySnap.link('semantic', metaSnap, snap | int)

creates a semantic link whose snaps are [this, metaSnap, snap].
Semantic links use a third (simple) snap to create annotative metadata about the relationship.
The current use is blends, for which metaSnap = {meta: 'blend', prop: 'propName'} to describe
which property the blend animates.

* mySnap.link('otherLinkType', snap, snap....)

creates any other link type (which are not yet fully worked out....)

#### Snap.removeLink(link | linkId) : this (Snap)

Removes a link from this Snap. this is an internal method that is part of a link's destroy() cycle.
however with multi-item links for which members may be added or removed it might be a necessary part
of the process of removing an id from a link (yet leaving it functional, intact).

#### Snap.getLinks(linkType : string, filter: function (optional) ) : [Links]

returns all links of a given type from the Snap. optionally filters the links, returning only those
links (of that type) for which the `filter(link)` return value is truthy.

#### Snap.nodeChildren(ids : boolean (optional) ) array (Snaps) | array (int)

if ids is true, returns an array of the ids of all the child snaps (an array of ints).
otherwise (by default) returns an array of all the child snaps (an array of Snaps).

#### Snap.nodeChildNodes() : array (Links)

returns all the node type links for which this snap is the parent; i.e., the links that connect
this snap to all its children.

#### Snap.hasNodeChildren() : boolean

returns .... you know...

#### Snap.nodeSpawn() : array (Snaps)

returns all the Snaps for which this snap is (directly or indirectly) a parent; a collection
of descendants.

#### Snap.nodeFamily() : object

A descriptive tree of the entire subordinate descendants. If the links have meta values
then the tree's structure alters to use the meta tag as collection indexes.

#### Snap.impulse(message : string, linkType : string, props: Object, meta : variant) : this (Snap)

broadcasts a message through a linked network (by default, to the Snap's descendants).
note, the initating snap will not receive the message -- it is only sent to the
See SNAP.impulse for details.

#### Snap.unparent() : this (Snap)

this method links all the children of this Snap to any/all parents the Snap has, and
destroys the parent/child link nodes between this Snap and its parents and children,
taking the Snap "out of the network" of nodes. Part of the `destroy()` process of a Snap,
but might be useful for moving Snaps around without obliterating the family tree's branch.

#### Snap.listen(message : string, listener: function, bind: boolean) : this (Snap)

adds a listener to the receptors for a given event (which may be emitted through impulses
or by directly dispatching to a snaps' receptor. This method may add a Signal to a Snaps receptor.
Do not call on a simple Snap -- wiill throw an error.

### Methods : Observers

### Methods : Update

#### hasPendingChanges(): boolean

reflects whether the snap has properties that have been changed using set() or inherit().

#### pending(keys: [String] (optional)) : Object

returns a summary of pending changes as an object whose properties are the fields
queued for update. If arguemnts are passed, returns only information on those keys.

Each value of the object is an object with the following schema:

* **old:** the current property value
* **pending:** the value the property will be set to on next update:
* **new:** (boolean) whether the property currently exists or not

#### update(broadcast: boolean, edition:int) : this (Snap)

Applies the pending updates to the object; also updates properties based on any current animations.
`edition` is meant to track which iteration of update is being executed.
If update is being called from the Space it will be provided; do not enter it yourself.

The purpose of edition is to ensure that processes for which it is critical that they not occur
more than once per update cycle have a reference as to which update cycle is underway.

If editiion is not present, then its assumed that the update is "local" (to this snap and its children)
and an edition will be created for this update cycle.

Update dispatches an 'updated' through the terminal of the snap.
If for some reason you want complete control over the update process,
clear the updated listeners from the termianl and add your own listener.

#### (the default listeners to 'updated') (broadcast, edition)

triggers one or more sub-processes in this order:

1. *updateBlends(broadcasdt, edition* (if there are any blends)
2. *updateProperties('blends')* (if there are any active blends)
3. *updatePhysics* (todo)
4. *updateObervers(broadcast, edition)*  (if there are any observers) -- deprecating
5. *updateProperties(broadcast, edition)* (if there are any pending changes) **this is the place where any
   property updates are made permanant -- the main point of `update()`. Note it is quite possible that
   some of the above events may add pending property changes.
6. *call update(broadcast, edition)* on each nodeChild (if broadcast is true).

note that simple or inactive snaps do not perform any action in the update cycle.

### Methods: Physics

TODO
