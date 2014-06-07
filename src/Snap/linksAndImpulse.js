Snap.prototype.link = function() {
    var args = _.toArray(arguments);
    var meta = null;
    var linkType;
    if (typeof(args[0]) == 'string') {
        linkType = args.shift();
    } else {
        linkType = 'node';
        meta = 'nodeChild';
    }
    args.unshift(this);
    return new SNAPS.Link(this.space, args, linkType, meta);
};

Snap.prototype.removeLink = function(link) {
    if (this.simple || (!this.links.length)) {
        return;
    }
    var linkId = isNaN(link) ? link.id : link;

    this.links = _.reject(this.links, function(link) {
        return link.inactive || (link.id == linkId);
    });
    return this
};

Snap.prototype.addLink = function(link) {
    if (this.simple) {
        return;
    }
    if (!_.find(this.links, function(l) {
        return l.id == link.id
    })) {
        this.links.push(link);
    }
};

/**
 * returns a subset of the links array based on type and an optional filter.
 *
 * NOTE: while the filter sugar may make for cleaner code,
 * iterating over a link array manually reduces one very common dip into submethods.
 * Consider this as an opportunity for more efficient code if you need to create a filter function.
 * You'll see some of this denormalizing below.
 *
 * @param linkType {string} the type of link to get.
 * @param filter {function} (optional) a sub-criteria fro which links you want to get.
 * @returns {Array}
 */
Snap.prototype.getLinks = function(linkType, filter) {
    var out = [];
    var link;
    if (!this.simple) { // simple elements have no links
        var l;
        if (filter) {
            for (l = 0; l < this.links.length; ++l) {
                link = this.links[l];
                if (link.active && (link.linkType == linkType) && filter(link, l)) {
                    out.push(link);
                }
            }
        } else {
            for (l = 0; l < this.links.length; ++l) {
                link = this.links[l];
                if (link.active && (link.linkType == linkType)) {
                    out.push(link);
                }
            }
        }
    }
    return out;
};

Snap.prototype.nodeChildren = function(ids) {
    var children = [];
    for (var i = 0; i < this.links.length; ++i) {
        var link = this.links[i];
        if (link.active && link.linkType == 'node' && link.meta == 'nodeChild' && link.snaps[0].id == this.id) {
            children.push(ids ? link.snaps[1].id : link.snaps[1]);
        }
    }
    return children;
};

Snap.prototype.nodeParentNodes = function() {
    var myId = this.id;
    return this.getLinks('node', function(n) {
        return n.snaps[1].id == myId;
    });
};

Snap.prototype.nodeParents = function(ids) {
    var nodes = this.nodeParentNodes();

    return _.reduce(nodes, function(o, link) {
        if (link.snaps[1].active) {
            o.push(ids ? link.snaps[0].id : link.snaps[0]);
        }
        return o;
    }, []);
};

Snap.prototype.nodeChildNodes = function() {
    var myId = this.id;
    return this.getLinks('node', function(link) {
        return link.meta == 'nodeChild' && link.snaps[0].id == myId;
    });
};

Snap.prototype.hasNodeChildren = function() {
    for (var i = 0; i < this.links.length; ++i) {
        var link = this.links[i];
        if (link.linkType == 'node' && link.meta == 'nodeChild' && link.snaps[0].id == this.id) {
            return true;
        }
    }

    return false;
};

Snap.prototype.nodeSpawn = function() {
    var children = this.nodeChildren();

    var leafs = [];
    var pp = [];
    var parents = [];

    while (children.length || parents.length) {
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            if (child.hasNodeChildren()) {
                parents.push(child);
            } else {
                leafs.push(child);
            }
        }
        children = [];

        for (var p = 0; p < parents.length; ++p) {
            var parent = parents[p];
            children = children.concat(parent.nodeChildren());
            pp.push(parent);
        }
        parents = [];
    }

    return pp.concat(leafs);

};

Snap.prototype.nodeFamily = function() {

    var id = this.id;
    var out = {
        id: id
    };

    var childLinks = this.getLinks('node', function(link) {
        return link.snaps[0].id == id;
    });

    for (var l = 0; l < childLinks.length; ++l) {
        var link = childLinks[l];
        var nodeChild = link.get(1);
        var grandChildren = nodeChild.nodeFamily();
        if (link.meta && _.isString(link.meta)) {
            if (!out[link.meta]) {
                out[link.meta] = [];
            }
            out[link.meta].push(grandChildren);
        } else {
            if (!out.children) {
                out.children = [];
            }
            out.children.push(grandChildren);
        }
    }

    return out;
};

Snap.prototype.impulse = function(message, linkType, props, meta) {
    SNAPS.impulse(this, message, linkType, props, meta);

    return this;
};

/**
 * prepare this snap to be destroyed;
 * links all the children of this snap to its parent(s) if any
 * and destroys its node links.
 */
Snap.prototype.unparent = function() {
    if (this.simple) {
        return;
    }

    var nodes = this.getLinks('nodes');
    if (!nodes.length) {
        return;
    }
    var children = [];
    var parents = [];

    for (var n = 0; n < nodes.length; ++n) {
        var node = nodes[n];
        if (node.snaps[0].id == this.id) { // child  link
            children.push(node.snaps[1]);
        } else if (node.snaps[1].id == this.id) {
            parents.push(node.snaps[0]);
        }
        node.destroy();
    }

    for (var p = 0; p < parents.length; ++p) {
        var parent = parents[p];
        if (parent && parent.active && (!parent.simple)) {
            for (var c = 0; c < children.length; ++c) {
                parent.link(children[c]);
            }
        }
    }

    return this;
};

Snap.prototype.resParent = function(link) {
    for (var l = 0; l < this.links.length; ++l) {
        if (this.links[l].linkType == 'resource' && (this.id == this.links[l].snaps[1].id)) {
            return link ? this.links[l] : this.links[l].snaps[0];
        }
    }
    return false;
};
