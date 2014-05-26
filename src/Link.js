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
    this.space = SNAP.assert.$TYPE(space, 'SPACE');
    this.linkType = linkType || 'set';
    //@TODO: limit linkType to known types

    this.ids = ids ? SNAPS.assert.array(ids) : [];
    this.meta = meta;

    this.validate();
    this.link();
};

SNAPS.Link.prototype.link = function () {
    var link = this;
    var space = this.space;

    _.each(this.ids, function (id) {
        space.addLink(id, link)
    });
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
            this.ids = this.ids.slice(0, 2);
            if (this.ids[1] == this.ids[0]) {
                throw 'cannot link node to self';
            }
            break;

        case 'set':
            this.ids = _.uniq(this.ids);
            break;

        case 'semantic':
            this.ids = this.ids.slice(0, 3);
            if (this.ids.length < 2) {
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

Snaps.Link.prototype.removeSnap = function(snap){

    if (typeof snap == 'object'){
        snap = SNAPS.assert.$TYPE(snap, 'SNAP').id;
    }

    if (!_.contains(this.ids, snap)){
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
            if (this.ids[0] == snap){
               return this.destroy();
            }
            break;
    }
    this.ids = _.difference(this.ids, [snap]);
    return this;
};