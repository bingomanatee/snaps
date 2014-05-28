/**
 *
 * This assert library is attened to allow in-context checking of type
 * upon assignment; it will return the input if the type checking passes.
 *
 * If the type checking does NOT pass AND the last argument is a function, that function is called (and its result passed.)
 * If the type checking does NOT pass and the last argument is NOT a function an error is thrown.
 * if message is set, it's set to the error's message value; otherwise an error defined by the check-types API is thrown.
 *
 * Alternatively, the SNAPS.assert.or method always returns a value -- either the input (if it is valid) or the third argument (if it is not).
 *
 */

SNAPS.assert = {

    $TYPE: function (obj, $type, message) {
        if (typeof(arguments[arguments.length - 1]) == 'function') {
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('$TYPE', args);
        }

        var objType = SNAPS.assert.prop(obj, '$TYPE');
        if (objType == $type) {
            return obj;
        } else {
            throw 'object does not have a $TYPE ' + $type;
        }
    },

    prop: function (obj, prop, message) {
        if (typeof(arguments[arguments.length - 1]) == 'function') {
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('prop', args);
        }
        obj = SNAPS.assert.obj(obj);
        prop = SNAPS.assert.string(prop, 'SNAPS.assert.prop.argument 2 must be a string');
        if (obj && prop) {
            if (obj.hasOwnProperty(prop) || (typeof(obj[prop]) != 'undefined')) {
                return obj[prop];
            } else {
                throw (message || 'object does not have a property ' + prop);
            }
        }
    },

    _assertCatch: function (name, args) {
        var catcher = args.pop();
        try {
            return SNAPS.assert[name].apply(SNAPS.assert, args);
        } catch (err) {
            return catcher(args, err, 'type');
        }
    },

    number: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.number(item) ? item : response();
        } else {
            check.verify.number(item, message);
            return item;
        }
    },

    'function': function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.fn(item) ? item : response();
        } else {
            check.verify.fn(item, message);
            return item;
        }
    },

    fn: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.fn(item) ? item : response();
        } else {
            check.verify.fn(item, message);
            return item;
        }
    },

    int: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.intNumber(item, message || 'Invalid integer') ? item : response();
        } else {
            check.verify.intNumber(item, message || 'Invalid integer');
            return item;
        }
    },

    or: function (typeName, item, alt) {

        switch (typeName) {
            case 'number':
                return check.number(item) ? item : alt;
                break;

            case 'array':
                return check.array(item) ? item : alt;

                break;

            case 'function':

                return check.fn(item) ? item : alt;
                break;

            case 'string':
                return check.string(item) ? item : alt;
                break;

            case 'object':
                return check.object(item) ? item : alt;
                break;

            default:
                throw new Error('cannot or type ' + typeName);
        }
    },

    arrayIndex: function (item, array, message) {
        if (typeof array == 'string') {
            message = array;
            array = null;
        }
        check.verify.intNumber(item, message);

        if (item < 0) {
            throw message || 'array index must be >= 0';
        }
        if (array && (item >= array.length)) {
            throw message || 'index not in array';
        }
        return item;
    },

    string: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.string(item, message) ? item : response();
        } else {
            check.verify.string(item, message);
            return item;
        }
    },

    object: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.object(item, message) ? item : response();
        } else {
            check.verify.object(item, message);
            return item;
        }
    },

    obj: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.object(item, message) ? item : response();
        } else {
            check.verify.object(item, message);
            return item;
        }
    },

    array: function (item, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;
        if (response) {
            return check.array(item, message) ? item : response();
        } else {
            check.verify.array(item, message);
            return item;
        }
    },

    arrayForce: function (item) {
        return _.isArray(item) ? item : [item];
    },

    /**
     * type is mostly deprecated except for the rare case when
     * the test type is part of a data structure/schema.
     * @returns {*}
     */
    type: function () {
        var args = _.toArray(arguments);
        var typeName = args.shift();
        return SNAPS.assert[typeName].apply(args);
    },

    notempty: function (item, typeName, message) {
        var response = (arguments.length > 1 && (typeof(arguments[arguments.length - 1]) == 'function')) ? arguments[arguments.length - 1] : false;

        var args = _.toArray(arguments);
        if (typeof(arguments[arguments.length - 1]) == 'function') {
            return SNAPS.assert._assertCatch('notempty', args);
        }
        switch (typeName) {
            case 'string':
                if (response) {
                    return check.unemptyString(item, message) ? item : response();
                } else {
                    check.verify.unemptyString(item, message);
                    return item;
                }
                break;
            case 'array':
                if (response) {
                    return check.array(item, message) && item.length ? item : response();
                } else {
                    check.verify.array(item, message);
                    if (!item.length) {
                        throw new Error(message || 'Array length must be > 0');
                    }
                    return item;
                }
                break;

            case 'number':
                if (response) {
                    return check.number(item) && item ? item : response();
                } else {
                    check.verify.number(item, message);
                    if (!item) {
                        throw new Error(message || 'Number must be nonzero');
                    }
                    return item;
                }
                break;

            default:
                throw "cannot understand size type " + typeName;
        }
        return item;
    },

    size: function (item, typeName, min, max, message) {
        var response;

        if (arguments.length > 2 && (typeof(arguments[arguments.length - 1]) == 'function')) {
            var args = _.toArray(arguments);
            response = args.pop();
            message = args[2];
            min = args[3] || null;
            max = args[4] || null;
        }

        switch (typeName) {
            case 'string':
            case 'array':

                if (min != null) {
                    if (item.length < min) {
                        if (response) {
                            return response('too short');
                        }
                        throw new Error(message || 'must be at least ' + min);
                    }
                }

                if (max != null) {
                    if (item.length > max) {
                        if (response) {
                            return response('too long');
                        }
                        throw new Error(message || 'must be no greater than ' + min);
                    }
                }

                break;

            case 'number':

                if (min != null) {
                    if (item < min) {
                        if (response) {
                            return response('too short');
                        }
                        throw new Error(message || 'must be at least ' + min);
                    }
                }

                if (max != null) {
                    if (item > max) {
                        if (response) {
                            return response('too long');
                        }
                        throw new Error(message || 'must be no greater than ' + min);
                    }
                }

                break;

            default:

                throw "cannot understand size type " + typeName;
        }
        return item;
    },

    toId: function (item, iType) {
        if (check.object(item)) {
            if (!item.$TYPE) {
                throw new Error('untyped object passed into toId');
            } else if (item.$TYPE == iType) {
                return item.id;
            } else {
                throw new Error('wrong type passed into toId: ' + item.$TYPE);
            }
        } else if (check.verify.intNumber(item, 'non-object, non-int passed into toId')){
            return item;
        }
    }
};
