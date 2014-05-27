Snap.prototype.removeLink = function (link) {
    if (!this.links.length) {
        return;
    }
    var linkId = isNaN(link) ? link.id : link;

    this.links = _.reject(this.links, function (link) {
        return link.id == linkId;
    })
};

Snap.prototype.addLink = function (link) {
    if (!_.find(this.links, function (l) {
        return l.id == link.id
    })) {
        this.links.push(link);
    }
};

Snap.prototype.link = function () {
    var args = _.toArray(arguments);
    var linkType;
    if (typeof(args[0]) == 'string') {
        linkType = args.shift();
    } else {
        linkType = 'node';
    }
    args.unshift(this);
    return new SNAPS.Link(this.space, args, linkType);
};

Snap.prototype.getLinks = function (linkType, filter) {
    var self = this;
    return _.filter(this.links, function (l) {
        return (l.linkType == linkType) ? ((filter) ? filter(l, self) : true) : false;
    });
};

Snap.prototype.nodeChildNodes = function () {
    var myId = this.id;
    return this.getLinks('node', function (n) {
        return n.ids[0] == myId;
    });
};

Snap.prototype.nodeChildren = function (ids) {
    var nodes = this.nodeChildNodes();

    return _.reduce(nodes, function (o, n) {
        var s = n.get(1, ids);
        if (s.active && !s.simple) {
            o.push(s);
        }
        return o;
    }, []);
};

Snap.prototype.hasNodeChildren = function () {
    for (var i = 0; i < this.links.length; ++i) {
        var link = this.links[i];
        if (link.linkType == 'node' && link.ids[0] == this.id) {
            return true;
        }
    }

    return false;
};

Snap.prototype.nodeSpawn = function (ids) {
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

Snap.prototype.nodeFamily = function () {

    var out = {
        id: this.id
    };

    var childLinks = this.getLinks('node', function (link) {
        return link.ids[0] == this.id;
    }.bind(this));

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

Snap.prototype.impulse = function (message, linkType, props, meta) {
    SNAPS.impulse(this, message, linkType, props, meta);
};

Snap.prototype.broadcastUpdate = function () {
    var children = this.nodeChildren();
    for (var c = 0; c < children.length; ++c) {
        children[c].update(true);
    }
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

Snap.prototype.listen = function (message, listener, bindListener) {
    if(!this.receptors[message]){
        this.receptors[message] = new signals.Signal();
    }
    this.receptors[message].add(bindListener ? listener.bind(this) : listener);
};