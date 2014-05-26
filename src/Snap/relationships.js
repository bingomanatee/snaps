Snap.prototype.getRels = function (relType) {
    if (this.simple) {
        throw 'Cannot add relationships to simple snaps';
    }
    return _.reduce(this.rels, function (list, rel) {
        if (rel.relType == relType) {
            list.push(rel);
        }
        return list;
    }, []);
};

Snap.prototype.rel = function (relType, toId, meta) {
    if (this.simple) {
        throw 'Cannot add relationships to simple snaps';
    }
    var rel = new SNAPS.Rel({
        space: this.space,
        relType: relType,
        from: this,
        to: toId,
        order: this.getRels(relType).length
    }, meta);
    this.rels.push(rel);
    return rel;
};

/**
 * gets a subset of relationships;
 * can filter by relType (if string),
 * toId (if number), or functionally.
 * Any number of filters can be passed; if none are, all rels are returned;
 * @returns {Array}
 */
Snap.prototype.getRels = function () {
    if (this.simple) {
        return [];
    }
    if (!arguments.length) {
        return this.rels.slice();
    }

    var i;
    var out;
    var rels = this.rels;

    for (var a = 0; a < arguments.length; ++a) {
        out = [];
        var filter = arguments[a];
        if (_.isString(filter)) {
            for (i = 0; i < rels.length; ++i) {
                if (rels[i].relType == filter) {
                    out.push(rels[i]);
                }
            }
        } else if (_.isNumber(filter)) {
            for (i = 0; i < rels.length; ++i) {
                if (rels[i].toId == filter) {
                    out.push(rels[i]);
                }
            }
        } else if (_.isFunction(filter)) {
            out = _.filter(rels, filter);
        }
        rels = out;
    }

    return out;
};

/**
 * adds (and creates if necessary) a child snap.
 *
 * @param snap {Snap}
 * @returns {*}
 */
Snap.prototype.addChild = function (snap) {
    /*    if (this.simple){
     throw 'Cannot add child to simple snap';
     }
     if (snap) {
     snap.unparent();
     } else {
     snap = this.space.snap();
     }
     snap.rel('parent', this);
     this.rel('child', snap);
     return snap;*/
    return this.link(snap);
};

Snap.prototype.children = function () {
    /*    if (this.simple){
     return [];
     }
     var out = [];
     for (var i = 0; i < this.rels.length; ++i) {
     if (this.rels[i].relType == 'child') {
     out.push(this.rels[i].toSnap());
     }
     }
     return out;*/
    return this.nodeChildren();
};

/**
 * prepare this snap to be destroyed;
 * links all the children of this snap to its parent(s) if any
 * and destroys its node links.
 */
Snap.prototype.unparent = function () {
    if (this.simple) {
        return;
    }

    var nodes = this.getLinks('nodes');
    if (!nodes.length) {
        return;
    }
    var childIds = [];
    var parentIds = [];

    for (var n = 0; n < nodes.length; ++n) {
        var node = nodes[n];
        if (node.ids[0] == this.id) { // child  link
            childIds.push(node.ids[1]);
        } else if (node.ids[1] == this.id) {
            parentIds.push(node.ids[0]);
        }
        node.destroy();
    }

    for (var p = 0; p < parentIds.length; ++p) {
        var parent = this.space.get(p);
        if (parent && parent.active && (!parent.simple)) {
            for (var c = 0; c < childIds.length; ++c) {
                parent.link(childIds[c]);
            }
        }
    }
};

/*
 Snap.prototype.adoptChildren = function (snap) {
 if (this.simple) {
 return;
 }

 var childRels = this.getRels(snap.id, 'child');
 for (var p = 0; p < childRels.length; ++p) {
 childRels[p].active = false;
 }

 var snapchildRels = snap.getRels('child');

 for (var s = 0; s < snapchildRels.length; ++s) {
 this.addChild(snapchildRels[s].toSnap());
 snapchildRels[s].active = false;
 }
 snap.cleanseRels();
 };*/

Snap.prototype.cleanseRels = function () {
    if (this.simple) {
        return;
    }
    this.rels = _.filter(this.rels, function (r) {
        return r.active;
    });
};

Snap.prototype.removeRel = function (rel) {
    if (this.simple) {
        return;
    }
    this.rels = _.reject(this.rels, function (r) {
        return r.id == rel.id;
    });
    rel.active = false;
};

Snap.prototype.broadcastToChildren = function () {
    this.broadcast('update');
};

Snap.prototype.broadcast = function (message, prop, value) {
    if (this.simple) {
        return;
    }
    var children = this.nodeChildren();

    for (var c = 0; c < children.length; ++c) {
        children[c].hear(message, prop, value);
    }
};