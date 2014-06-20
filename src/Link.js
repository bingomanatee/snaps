var linkId = 0;
/**
 *
 * Link (Relationship) collects / connects two or more snaps.
 * It can be used to map one to many snaps, do parent/child relationships, etc.
 *
 * current known types include
 * -- 'node' : first id is parent, second id is child. The option exists for "multiparent" children.
 * -- 'set': all snaps are equal members; order is irrelevant.
 * -- 'semantic': three snaps, id[0] relates to id[2] with id [1] describing relationship
 * -- '1m': the first id relates to all subsequent snaps
 * -- 'graph': the two nodes are linked in a open graph. multiple graphs can exist -- set meta to the name of your graph.
 * -- 'resource': a relationship that is application-specific - the meta property of the link can provide more detail.
 *
 * @param space {SNAPS.Space}
 * @param snaps [{SNAPS.Snap | id }]
 * @param linkType {String} see above
 * @param meta {variant} any kind of annotation -- optional.
 * @constructor
 */
SNAPS.Link = function(space, snaps, linkType, meta) {
    this.id = ++linkId;
    this.active = true;
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');
    this.linkType = linkType || 'set';
    //@TODO: limit linkType to known types

    if (check.array(snaps)) {
        this.snaps = snaps;
    } else if (snaps) {
        this.snaps = [snaps];

    } else {
        this.snaps = [];
    }
    this.meta = meta || '';

    this.validate();
    this.link();
};

/**
 * populate this link amongst all its members.
 * Members are responsible for not allowing redundancy in thier link collections.
 *
 */
SNAPS.Link.prototype.link = function() {
    for (var l = 0; l < this.snaps.length; ++l){
        this.snaps[l].addLink(this)
    }
};

/**
 * the preferred way of getting a link's snap out of its snaps collection
 * @param i {int} the index
 * @returns {*}
 */
SNAPS.Link.prototype.get = function(i) {
    return  this.snaps[i];
};

SNAPS.Link.prototype.$TYPE = 'LINK';

SNAPS.Link.prototype.validate = function() {
    this.snaps = _.map(this.snaps, function(snap) {
        if (typeof snap == 'object') {
            return SNAPS.assert.snap(snap);
        } else if (_.isNumber(snap)) {
            return this.space.get(snap);
        } else {
            console.log('strange link target: %s', snap);
            throw 'invalid snaps in link';
        }
    }, this);

    switch (this.linkType) { //@TODO: refactor using helper classes
        case 'node':
            if (this.snaps.length != 2) {
                throw 'node link must have two snaps';
            }
            this.snaps = this.snaps.slice(0, 2);
            if (this.snaps[1] == this.snaps[0]) {
                throw 'cannot link node to self';
            }
            break;

        case 'resource':
            if(this.snaps.length != 2){
                throw 'resource link must have two snaps';
            }
            break;

        case 'graph':
            if (this.snaps.length != 2) {
                throw 'graph link must have two snaps';
            }
            this.snaps = this.snaps.slice(0, 2);
            if (this.snaps[1] == this.snaps[0]) {
                throw 'cannot link graph to self';
            }
            break;

        case 'set':
            this.snaps = _.uniq(this.snaps);
            break;

        case 'semantic':
            this.snaps = this.snaps.slice(0, 3);
            if (this.snaps.length < 3) {
                // add a simple annotative data node
                this.snaps.splice(1, 0, this.space.snap(true));
            }
            break;

        case '1m':
            break;
    }
};

SNAPS.Link.prototype.isValid = function(returnMessage) {
    if (!this.active) {
        return returnMessage ? 'inactive' : false;
    }
    var badId = _.find(this.snaps, check.not.object);
    if (badId) {
        return returnMessage ? 'non object snap' : false;
    }

    switch (this.linkType) {
        case 'node':
            if (this.snaps.length != 2) {
                return returnMessage ? 'node link must have two snaps' : false;
            }
            break;

        case 'resource':
            if (this.snaps.length < 2) {
                return returnMessage ? 'too few snaps for node' : false;
            }
            if (!this.space.hasSnap(this.snaps[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.snaps[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case 'graph':
            if (this.snaps.length < 2) {
                return returnMessage ? 'too few snaps for graph' : false;
            }
            if (!this.space.hasSnap(this.snaps[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.snaps[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case 'set':
            for (var i = 0; i < this.snaps.length; ++i) {
                if (!this.space.hasSnap(this.snaps[i])) {
                    return returnMessage ? 'bad id ' + i : false;
                }
            }
            break;

        case 'semantic':
            if (this.snaps.length < 3) {
                return returnMessage ? 'must have 3 snaps for semantic link' : false;
            }
            if (!this.space.hasSnap(this.snaps[2])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.snaps[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.snap(this.snaps[1]).simple) {
                return returnMessage ? 'snap 1 must be simple' : false;
            }
            if (!this.space.hasSnap(this.snaps[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case '1m':
            for (var i = 0; i < this.snaps.length; ++i) {
                if (!this.space.hasSnap(this.snaps[i])) {
                    return returnMessage ? 'bad id ' + i : false;
                }
            }
            break;
    }

    return true;
};

SNAPS.Link.prototype.toJSON = function() {
    return {snaps: _.pluck(this.snaps, 'id')};
};

SNAPS.Link.prototype.destroy = function() {
    this.active = false;
    for (var s = 0; s < this.snaps.length; ++s) {
        this.snaps[s].removeLink(this);
    }
};

/**
 * adds a new member to the collection
 * @returns {*}
 */
SNAPS.Link.prototype.grow = function(snap) {
    this.snaps.push(SPACE.assert.$TYPE(snap, 'SNAP'));
    return this;
};

SNAPS.Link.prototype.hasSnap = function(snap) {
    var id = SNAPS.isSnap(snap) ? snap.id :  snap;

    for (var s = 0; s < this.snaps.length; ++s){
        if (this.snaps[s].id == id) return true;
    }
    return false;
};

SNAPS.Link.prototype.removeSnap = function(snap) {
    var hasSnap = false;
    var id = snap.id;
    var sansSnap = [];
    for (var s = 0; s < this.snaps.length; ++s){
        if (this.snaps[s].id == id) {
            hasSnap = true;
        } else {
            sansSnap.push(this.snaps[s]);
        }
    }
    if (!hasSnap) return;

    this.snaps = sansSnap;

    if (!this.isValid()){
        this.destroy();
    }
};

/**
 * a debugging aid -- the content of a link
 * @returns {Object}
 */
SNAPS.Link.prototype.identity = function() {
    var out = _.pick(this, 'id', 'active', '$TYPE');
    out.snaps = _.pluck(this.snaps, 'id');
    return out;
};

/**
 * call a function over a set of links -- basically a forEach for a network.
 * @param impulse
 */
SNAPS.Link.prototype.impulse = function(impulse) {
    if (impulse.$TYPE != 'IMPULSE') {
        var args = _.toArray(arguments);
        impulse = SNAPS.impulse.apply(SNAPS, args);
        impulse.setOrigin(this);
    }

    if (!impulse.active) {
        return;
    }

    if (impulse.linkFilter) {
        if (!impulse.linkFilter(this)) {
            return;
        }
    }

    /**
     * send the impulse to any snap in this link that have not heard it already.
     * note - the natual flow of semantic and node impulses is always downward;
     * so imuplse.startId skips the known snaps in favor of downstream ones.
     */

    for (var i = impulse.startId; i < this.snaps.length; ++i) {
        var add = true;
        var id = this.snaps[i].id;
        for (var h = 0; add && h < impulse.heard.length; ++h) {
            if (impulse.heard[h] == id) {
                add = false;
            }
        }
        if (add) {
            var receivingSnap = this.get(i);
            if (receivingSnap.active && (!receivingSnap.simple)) {
                receivingSnap.impulse(impulse);
            }
        }
    }

};
