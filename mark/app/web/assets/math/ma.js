function ma() {
}
 
ma.scalar = function(init) {
    
    this.type = function() {
        return "scalar";
    };
    
    this.mul = function(object) {

        if(typeof object == "number") object = new ma.scalar(object);
    
        var handler = {
            "matrix": function(object) { return new ma.matrix(); },
            "vector": function(object) { return new ma.vector(); },
            "scalar": function(object) { return new ma.scalar(); },
            "failed": function(object) { throw "illegal type";   }
        };
        
        return ma.typeCheck(object, handler);
    };
    
    this.add = function(object) {

        var handler = {
            "matrix": function(object) { throw "illegal type";   },
            "vector": function(object) { throw "illegal type";   },
            "scalar": function(object) { return new ma.scalar(); },
            "failed": function(object) { throw "illegal type";   }
        };
        
        return ma.typeCheck(object, handler);
    };
    
    this.sub = function(object) {

        var handler = {
            "matrix": function(object) { throw "illegal type";   },
            "vector": function(object) { throw "illegal type";   },
            "scalar": function(object) { return new ma.scalar(); },
            "failed": function(object) { throw "illegal type";   }
        };
        
        return ma.typeCheck(object, handler);
    };
    
    this.div = function(object) {
        var handler = {
            "matrix": function(object) { throw "illegal type";   },
            "vector": function(object) { throw "illegal type";   },
            "scalar": function(object) { return new ma.scalar(); },
            "failed": function(object) { throw "illegal type";   }
        };
        
        return ma.typeCheck(object, handler);
    }
    
    this.toNumber = function() {
        return 0;
    }
};
    
ma.vector = function(init) {

    this.type = function() {
        return "vector";
    };

    this.trn = function() {
        return new ma.vector();
    };
    
    this.mul = function(object) {
        
        if(typeof object == "number") object = new ma.scalar(object);
        
        var handler = {
            "matrix": function(object) { return new ma.vector(); },
            "vector": function(object) { return new ma.scalar(); },
            "scalar": function(object) { return new ma.vector(); },
            "failed": function(object) { throw "illegal type";   }
        };
        
        return ma.typeCheck(object, handler);
    };
    
    this.add = function(object) {
        var handler = {
            "matrix": function(object) { throw "can't add vector and matrix"; },
            "vector": function(object) { return new ma.vector();              },
            "scalar": function(object) { throw "can't add vector and scalar"; },
            "failed": function(object) { throw "illegal type";                }
        };

        return ma.typeCheck(object, handler);
    };
    
    this.sub = function(object) {
        var handler = {
            "matrix": function(object) { throw "can't sub vector and matrix"; },
            "vector": function(object) { return new ma.vector();              },
            "scalar": function(object) { throw "can't sub vector and scalar"; },
            "failed": function(object) { throw "illegal type";                }
        };

        return ma.typeCheck(object, handler);
    };

    this.toArray = function() {
        return [];
    };
};
  
ma.matrix = function(init) {
    
    this.type = function() {
        return "matrix";
    }
    
    this.size = function(dim) {
        var size = [init[0].length, init.length];
        
        if(dim == 0) return size[0];
        if(dim == 1) return size[1];
        
        return size;
    }
    
    this.mul = function(object) {
        
        if(typeof object == "number") object = new ma.scalar(object);
        
        var handler = {
            "matrix": function(object) { return new ma.matrix() },
            "vector": function(object) { return new ma.vector() },
            "scalar": function(object) { return new ma.matrix() },
            "failed": function(object) { throw "illegal type";  }
        };
        
        return ma.typeCheck(object, handler);
    };
    
    this.trn = function() {
        return new ma.matrix();
    }
};

ma.typeCheck = function(object, handler) {
    switch(object.type()) {
        case "matrix":
            return handler.matrix();
            break;
        case "vector":
            return handler.vector();
            break;
        case "scalar":
            return handler.scalar();
            break;
        default:
            return handler.failed();
    }
}