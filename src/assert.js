/**
 *
 * The assert methods are intended to inforce type integrity; they throw an error if the object does not pass
 * the type filter; otherwise they echo the input. As such they can be used inline during assignment.
 *
 * The alternative use of the filters is by passing a function; if the test fails, the result of the function
 * (which is passed the original arguments) is returned.
 */

SNAPS.assert = {

    $TYPE: function(obj, $type, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
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

    prop: function(obj, prop, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('prop', args);
        }
        obj = SNAPS.assert.type(obj, 'object');
        prop = SNAPS.assert.type(prop, 'string', 'SNAPS.assert.prop.argument 2 must be a string');
        if (obj && prop){
            if (obj.hasOwnProperty(prop) || (typeof(obj[prop]) != 'undefined')){
                return obj[prop];
            } else {
                throw (message || 'object does not have a property ' + prop);
            }
        }
    },

    _assertCatch: function(name, args){
        var catcher = args.pop();
        try {
            return SNAPS.assert[name].apply(SNAPS.assert, args);
        } catch(err){
            return catcher(args, err, 'type');
        }
    },

    number: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('number', args);
        }
        if (!_.isNumber(item)) {
            throw (message || 'must be a number');
        }
        return item;
    },

    'function': function(item, message){
        if(arguments.length > 1 && typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('function', args);
        }
        if (!_.isFunction(item)) {
            throw (message || 'must be a function');
        }
        return item;
    },

    int: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('number', args);
        }
        if (!_.isNumber(item)) {
            throw (message || 'must be a number');
        }
        if (item % 1){
            throw (message || 'must be an integer');
        }
        return item;
    },

    or: function(){
        var args = _.toArray(arguments);
        var name = args.shift();
        var alt = args.pop();
        try {
           return SNAPS.assert[name].apply(SNAPS.assert, args);
        } catch(err){
            return alt;
        }
    },

    string: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('string', args);
        }
        if (!_.isString(item)) {
            throw (message || 'must be a string');
        }
        return item;
    },

    object: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('object', args);
        }
        if (!_.isObject(item)) {
            throw (message || 'must be an object');
        }
        return item;
    },

    array: function(item, message){
        if(typeof(arguments[arguments.length -1]) == 'function'){
            var args = _.toArray(arguments);
            return SNAPS.assert._assertCatch('array', args);
        }

        if (!_.isArray(item)) {
            throw (message || 'must be an array');
        }
        return item;
    },

    arrayForce: function(item){
        return _.isArray(item) ? item : [item];
    },

    type: function (item, typeName, message) {
        switch (typeName) {
            case 'number':
                return SNAPS.assert.number(item, message);
                break;

            case 'string':
                return SNAPS.assert.string(item, message);
                break;

            case 'object':
                return SNAPS.assert.object(item, message);
                break;

            case 'array':
                return SNAPS.assert.array(item,message);
        }
        return item;
    },

    notempty: function(item, typeName, message){
        var args = _.toArray(arguments);
        if(typeof(arguments[arguments.length -1]) == 'function'){
            return SNAPS.assert._assertCatch('notempty', args);
        }
        switch (typeName) {
            case 'string':
            case 'array':

                    if (item.length < 1) {
                        throw message || 'must be not empty';
                    }

                break;

            case 'number':
                return item != 0;
                break;

            default:
                throw "cannot understand size type " + typeName;
        }
        return item;
    },

    size: function (item, typeName, message, min, max) {
        var args = _.toArray(arguments);
        if(typeof(arguments[arguments.length -1]) == 'function'){
            return SNAPS.assert._assertCatch('size', args);
        }
        if (arguments.length < 4) {
            min = 1;
            max = null;
        }
        switch (typeName) {
            case 'string':
            case 'array':

                if (min != null) {
                    if (item.length < min) {
                        throw message || 'must be at least ' + min;
                    }
                }

                if (max != null) {
                    if (item.length > max) {
                        throw message || 'must be no greater than ' + max;
                    }
                }

                break;

            case 'number':

                if (min != null) {
                    if (item < min) {
                        throw message || 'must be at least ' + min;
                    }
                }

                if (max != null) {
                    if (item > max) {
                        throw message || 'must be no greater than ' + max;
                    }
                }

                break;

            default:

                throw "cannot understand size type " + typeName;
        }
        return item;
    }


};