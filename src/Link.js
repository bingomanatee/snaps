var linkId = 0;
/**
 *
 * Link (Relationship) collects / connects two or more snaps.
 * It can be used to map one to many snaps, do parent/child relationships, etc.
 *
 * current known types include
 * -- 'node' : first id is parent, second id is child. The option exists for "multiparent" children.
 * -- 'set': all ids are equal members; order is irrelevant.
 * -- 'semantic': three ids, id[0] relates to id[2] with id [1] describing relationship
 * -- '1m': the first id relates to all subsequent ids
 * -- 'graph': the two nodes are linked in a nondeterministic graph. multiple graphs can exist -- set meta to the name of your graph.
 *
 * @param space {SNAPS.Space}
 * @param ids {[{int}]}
 * @param linkType {String} see above
 * @param meta {variant} any kind of annotation -- optional.
 * @constructor
 */
SNAPS.Link = function (space, ids, linkType, meta) {
    this.id = ++linkId;
    this.active = true;
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');
    this.linkType = linkType || 'set';
    //@TODO: limit linkType to known types

    this.ids = ids ? SNAPS.assert.array(ids) : [];
    this.meta = meta;

    this.validate();
    this.link();
    this.cache = [];
};

SNAPS.Link.prototype.link = function () {
    var link = this;
    var space = this.space;

    _.each(this.ids, function (id) {
        space.addLink(id, link)
    });
};

SNAPS.Link.prototype.get = function (i, id, safe) {
    if (safe) {
        try {
            i = SNAPS.assert.arrayIndex(i, this.ids);
        } catch (err) {
            return null;
        }
    }

    if (id) {
        return this.ids[i];
    }

    if (this.cache[i]) {
        if (this.cache[i].id != this.ids[i]) {
            this.cache[i] = this.space.snap(this.ids[i]);
        }
    } else {
        this.cache[i] = this.space.snap(this.ids[i]);
    }

    return this.cache[i];

};

SNAPS.Link.prototype.$TYPE = 'LINK';

SNAPS.Link.prototype.validate = function () {
    this.ids = _.map(this.ids, function (id) {
        if (typeof id == 'object') {
            if (id.$TYPE == 'SNAP') {
                return id.id
            } else {
                throw 'All ids must be numbers or Snaps';
            }
        } else {
            return id;
        }
    });

    switch (this.linkType) {
        case 'node':
            if (this.ids.length != 2) {
                throw 'node link must have two ids';
            }
            this.ids = this.ids.slice(0, 2);
            if (this.ids[1] == this.ids[0]) {
                throw 'cannot link node to self';
            }
            break;

        case 'graph':
            if (this.ids.length != 2) {
                throw 'graph link must have two ids';
            }
            this.ids = this.ids.slice(0, 2);
            if (this.ids[1] == this.ids[0]) {
                throw 'cannot link graph to self';
            }
            break;

        case 'set':
            this.ids = _.uniq(this.ids);
            break;

        case 'semantic':
            this.ids = this.ids.slice(0, 3);
            if (this.ids.length < 3) {
                // add a simple annotative data node
                var semNode = this.space.snap(true);
                this.ids.splice(1, 0, semNode.id);
            }
            break;

        case '1m':
            // ??
            break;
    }
};

SNAPS.Link.prototype.isValid = function (returnMessage) {
    if (!this.active) {
        return returnMessage ? 'inactive' : false;
    }
    var badId = _.find(this.ids, check.not.number);
    if (badId) {
        return returnMessage ? 'non numeric id' : false;
    }

    switch (this.linkType) {
        case 'node':
            if (this.ids.length < 2) {
                return returnMessage ? 'too few IDs for node' : false;
            }
            if (!this.space.hasSnap(this.ids[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.ids[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case 'graph':
            if (this.ids.length < 2) {
                return returnMessage ? 'too few IDs for graph' : false;
            }
            if (!this.space.hasSnap(this.ids[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.ids[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case 'set':
            badId = _.reduce(this.ids, function (badId, id) {
                if (badId != -1) {
                    return badId;
                }
                if (!this.space.hasSnap(id)) {
                    badId = id;
                }
                return badId;
            }, -1, this);

            if (badId != -1) {
                return returnMessage ? 'bad id ' + badId : false;
            }
            break;

        case 'semantic':
            if (this.ids.length < 3) {
                return returnMessage ? 'must have 3 snaps for semantic link' : false;
            }
            if (!this.space.hasSnap(this.ids[2])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.hasSnap(this.ids[1])) {
                return returnMessage ? 'bad id 1' : false;
            }
            if (!this.space.snap(this.ids[1]).simple) {
                return returnMessage ? 'snap 1 must be simple' : false;
            }
            if (!this.space.hasSnap(this.ids[0])) {
                return returnMessage ? 'bad id 0' : false;
            }
            break;

        case '1m':
            badId = _reduce(this.ids, function (badId, id) {
                if (badId != -1) {
                    return badId;
                }
                if (!this.space.hasSnap(id)) {
                    badId = id;
                }
                return badId;
            }, -1, this);

            if (badId != -1) {
                return returnMessage ? 'bad id ' + badId : false;
            }
            break;
    }

    return true;
};

SNAPS.Link.prototype.toJSON = function () {
    return {ids: this.ids.slice()}
};

SNAPS.Link.prototype.destroy = function () {
    this.active = false;
    this.space.removeLink(this);
};

/**
 * adds a new member to the collection
 * @returns {*}
 */
SNAPS.Link.prototype.grow = function (snap) {
    if (!snap && snap.$TYPE == 'SNAP') {
        var args = _.toArray(arguments);
        snap = this.space.snap.apply(this.space, args);
    }
    this.ids.push(snap.id);
    return snap;
};

SNAPS.Link.prototype.removeSnap = function (snap) {

    if (typeof snap == 'object') {
        snap = SNAPS.assert.$TYPE(snap, 'SNAP').id;
    }

    if (!_.contains(this.ids, snap)) {
        return;
    }

    switch (this.linkType) {
        case 'node':
            return this.destroy();
            break;

        case 'set':
            break;

        case 'semantic':
            return this.destroy();
            break;

        case '1m':
            if (this.ids[0] == snap) {
                return this.destroy();
            }
            break;
    }
    this.ids = _.difference(this.ids, [snap]);
    return this;
};

SNAPS.Link.prototype.impulse = function (impulse) {
    if (impulse.$TYPE != 'IMPULSE') {
        var args = _.toArray(arguments);
        impulse = SNAPS.impulse.apply(SNAPS, args);
        impulse.setOrigin(this);
    }

    if (!impulse.active) {
        return;
    }

    if (impulse.linkFilter){
        if (!impulse.linkFilter(this)){
            return;
        }
    }

    /**
     * send the impulse to any snap in this link that have not heard it already.
     * note - the natual flow of semantic and node impulses is always downward;
     * so imuplse.startId skips the known ids in favor of downstream ones.
     */

    for (var i = impulse.startId; i < this.ids.length; ++i) {
        var add = true;
        var id = this.ids[id];
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
