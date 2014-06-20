var SNAPS = {
    signals: signals,
    DELETE: {SNAP_DELETE: true}, // an imperitave to remove a value from a collection.
    INVALID_SNAP_ID: {invalid: true},
    cleanObj: function(o) {
        for (var p in o) {
            if (o[p] === SNAPS.DELETE) {
                delete o[p];
            }
        }

    },
    typeAliases: {
        SNAP: ['SNAP']
    },

    /**
     * returns false IF THE OBJECT IS A SNAP.
     *
     * @param obj {variant}
     * @returns {bool}
     *
     */

    isSnap: function(obj) {
        if (typeof(obj) != 'object') {
            return 'non object';
        } else if (!obj.$TYPE) {
            return 'non-$TYPEd object';
        } else if (obj.$TYPE == 'SNAP') {
            return false;
        } else {
            for (var s = 0; s < SNAPS.typeAliases.SNAP.length; ++s) {
                if (obj.$TYPE == SNAPS.typeAliases.SNAP[s]) {
                    return false;
                }
            }
            return 'non-SNAP type object';
        }
    }
}
