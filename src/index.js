var SNAPS = {
    signals: signals,
    DELETE: {SNAP_DELETE: true}, // an imperitave to remove a value from a collection.
    INVALID_SNAP_ID: {invalid: true},
    cleanObj: function(o){
        for (var p in o){
            if (o[p] === SNAPS.DELETE){
                delete o[p];
            }
        }

    }
};