class BuildString {

    constructor(props){
        this.data = [''];

        if(props && props.constructor === Array){
            this.data = props
        }else if(props.data && props.data.constructor === Array){
            this.data = props.data;

            if(props.preHandler && props.preHandler.constructor === Function){
                this.preHandler = props.preHandler;
            }
        }

        this.partHandler = {
            string: (str, part, callback) => {
                str += part;
                callback(str);
            },
            object: (str, part, callback) => {
                if(!part.hasOwnProperty('value')){
                    this.error('object must have a "value" property \n\n'+JSON.stringify(part));
                }
                var handler = this.getHandler(this.partHandlerLink, part.value);

                handler(str, part.value, (resStr) => {
                    var part_str = resStr.slice(str.length);
                    var valid = this.verify({
                        value: part_str,
                        test: part.test
                    });

                    if(!valid){
                        this.valid = valid;
                    }

                    str += part_str;
                    callback(str);
                });
            },
            function: (str, part, callback) => {
                if(part.length < 1){
                    this.error('function must call a callback \n\n'+part);
                }

                part(function (res) {
                    str += res;
                    callback(str);
                });
            }
        };

        this.verifyHandlers = {
            regexp: (part) => {
                return part.test.test(part.value);
            }
        };

        this.partHandlerLink = {
            string: this.partHandler.string,
            date: this.partHandler.string,
            number: this.partHandler.string,
            object: this.partHandler.object,
            function: this.partHandler.function
        };

        this.verifyHandlersLink = {
            regexp: this.verifyHandlers.regexp
        };

        return this;
    };

    getHandler(obj_handlers, value) {
        var handler = obj_handlers[ value.constructor.name.toLowerCase() ];

        if(handler){
            return handler;
        }else{
            this.error('Handler for ' + value.constructor.name + ' not defined in \n\n'+value);
        }
    };

    verify(part) {
        var valid = true;

        if(part.test !== undefined && part.test !== null){
            var handler = this.getHandler( this.verifyHandlersLink, part.test );
            valid = handler(part);
        }
        return valid;
    };

    build(callback) {
        this.valid = true;
        (function buildPart(active_part_index, str) {
            if(active_part_index < this.data.length){
                var preHandler = this.preHandler;
                var part = this.data[ active_part_index ];

                if(preHandler && preHandler.constructor === Function){
                    part = preHandler( part );
                }

                part = (part !== undefined && part !== null) ? part : '';
                var handler = this.getHandler(this.partHandlerLink, part);
                handler(str, part, buildPart.bind(this, active_part_index+1));
            }else{
                if(callback) callback(str, this.valid);
            }
        }).call(this, 0, '');
    }

    error(msg) {
        throw new Error(msg);
    };
};

module.exports = BuildString;