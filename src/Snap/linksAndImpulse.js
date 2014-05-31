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
    if (this.simple) return;
    if (!_.find(this.links, function(l) {
        return l.id == link.id
    })) {
        this.links.push(link);
    }
};

Snap.prototype.getLinks = function(linkType, filter) {
    if (this.simple) {
        return [];
    }
    var self = this;
    return _.filter(this.links, function(l) {
        if (l.active = false) return false;
        return (l.linkType == linkType) ? ((filter) ? filter(l, self) : true) : false;
    });
};

Snap.prototype.nodeChildren = function(ids) {
    var nodes = this.nodeChildNodes();

    return _.reduce(nodes, function(o, link) {
        if (link.snaps[1].active) {
            o.push(ids ? link.snaps[1].id : link.snaps[1]);
        }
        return o;
    }, []);
};

Snap.prototype.nodeParentNodes = function(){
    var myId = this.id;
    return this.getLinks('node', function(n) {
        return n.snaps[1].id == myId;
    });
};

Snap.prototype.nodeParents = function(ids){
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
