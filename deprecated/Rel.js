
var relId = 0;
/**
 *
 * Rel (Relationship) is a trinary join of two snaps;
 * it has a string relType and optional metadata.
 * It exists to allow for semantic joins
 * 
 * @param params {Object} configures the Rel
 * @param meta {Object} an optional annotation
 * @constructor
 */
SNAPS.Rel = function (params, meta) {
    this.id = ++relId;
    var space = SNAPS.assert.prop(params, 'space');
    this.space = SNAPS.assert.$TYPE(space, 'SPACE');
    this.meta = _.isObject(meta) ? meta : false;

    var fromId = SNAPS.assert.prop(params, 'from');
    if (!_.isNumber(fromId)) {
        fromId = SNAPS.assert.$TYPE(fromId, 'SNAP').id;
    }
    this.fromId = fromId;

    var toId = SNAPS.assert.prop(params, 'to');
    if (!_.isNumber(toId)) {
        toId = SNAPS.assert.$TYPE(toId, 'SNAP').id;
    }
    this.toId = toId;

    var relType = SNAPS.assert.prop(params, 'relType');
    relType = SNAPS.assert.string(relType, 'relType must be string');
    this.relType = SNAPS.assert.notempty(relType, 'string', 'relType must not be empty');
    this.active = true;
};

SNAPS.Rel.prototype.broadcast = function (fromId, message, property, value) {
    this.toSnap().hear(message, property, value);
};

SNAPS.Rel.prototype.toSnap = function () {
    return this.space.snap(this.toId, true);
};

SNAPS.Rel.prototype.fromSnap = function () {
    return this.space.snap(this.fromId, true);
};

SNAPS.Rel.prototype.toJSON = function(){
    return {fromId: this.fromId, toId: this.toId, relType: this.relType}
};

SNAPS.Rel.prototype.destroy = function(){
    this.active = false;
    this.fromSnap().removeRel(this);
};