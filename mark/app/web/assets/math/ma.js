ma = function() {
    this.type = function() {
        return "ma";
    }
    
    this.typeCheck = function(object, handler) {
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
    };
};
ma.scalar = function(init) {

    this.type = function() {
        return "ma.scalar";
    };
    
    this.add = function(object) {

        var handler = {
            "ma.matrix": function(object) { throw "illegal type";   },
            "ma.vector": function(object) { throw "illegal type";   },
            "ma.scalar": function(object) { return new ma.scalar(); },
            "failed"   : function(object) { throw "illegal type";   }
        };
        
        return this.typeCheck(object, handler);
    };
    
    this.sub = function(object) {

        var handler = {
            "ma.matrix": function(object) { throw "illegal type";   },
            "ma.vector": function(object) { throw "illegal type";   },
            "ma.scalar": function(object) { return new ma.scalar(); },
            "default"  : function(object) { throw "illegal type";   }
        };
        
        return this.typeCheck(object, handler);
    };

    this.mul = function(object) {

        if(typeof object == "number") object = new ma.scalar(object);
    
        var handler = {
            "ma.matrix": function(object) { return new ma.matrix(); },
            "ma.vector": function(object) { return new ma.vector(); },
            "ma.scalar": function(object) { return new ma.scalar(); },
            "default"  : function(object) { throw "illegal type";   }
        };
        
        return this.typeCheck(object, handler);
    };
    
    this.div = function(object) {
        var handler = {
            "ma.matrix": function(object) { throw "illegal type";   },
            "ma.vector": function(object) { throw "illegal type";   },
            "ma.scalar": function(object) { return new ma.scalar(); },
            "default"  : function(object) { throw "illegal type";   }
        };
        
        return this.typeCheck(object, handler);
    };
    
    this.toNumber = function() {
        return 0;
    };
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
        
        return this.typeCheck(object, handler);
    };
    
    this.add = function(object) {
        var handler = {
            "matrix": function(object) { throw "can't add vector and matrix"; },
            "vector": function(object) { return new ma.vector();              },
            "scalar": function(object) { throw "can't add vector and scalar"; },
            "failed": function(object) { throw "illegal type";                }
        };

        return this.typeCheck(object, handler);
    };
    
    this.sub = function(object) {
        var handler = {
            "matrix": function(object) { throw "can't sub vector and matrix"; },
            "vector": function(object) { return new ma.vector();              },
            "scalar": function(object) { throw "can't sub vector and scalar"; },
            "failed": function(object) { throw "illegal type";                }
        };

        return this.typeCheck(object, handler);
    };

    this.toArray = function() {
        return [];
    };
};
ma.matrix = function(init) {
    
    this.type = function() {
        return "matrix";
    }
    
    this.shape = function(dim) {
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
        
        return this.typeCheck(object, handler);
    };
    
    this.trn = function() {
        return new ma.matrix();
    }
};

ma.scalar.prototype = new ma();
ma.vector.prototype = new ma();
ma.matrix.prototype = new ma();

ma.dl = function(tensor) {
    this.getTensor = function() {
        return tensor;
    }
};
ma.dl.scalar = function(number) {
    
    ma.dl.call(this, number.rankType ? number : dl.scalar(number));
    
    this.add = function(object) {
        return new ma.dl.scalar(this.getTensor().add(object.getTensor()));
    };
    
    this.sub = function(object) {
        return new ma.dl.scalar(this.getTensor().sub(object.getTensor()));
    };

    this.mul = function(object) {
        return new ma.dl.scalar(this.getTensor().mul(object.getTensor()));
    };
    
    this.div = function(object) {
        return new ma.dl.scalar(this.getTensor().div(object.getTensor()));
    };
    
    this.print = function() {
        return this.getTensor().print();
    }
    
    this.toNumber = function() {
        return this.getTensor().dataSync()[0];
    };
};
ma.dl.vector = function(array) {
    
    //ma.dl.call(this, array.rankType ? array : dl.tensor2d(array, [array.length,1]));
    ma.dl.call(this, array.rankType ? array : dl.tensor2d(array, [array.length,1]));
    
    this.shape = function() {
        return this.getTensor().shape;
    };
    
    this.norm = function() {
        return new ma.dl.scalar(this.getTensor().norm());
    }
    
    this.trn = function() {
        return new ma.dl.vector(this.getTensor().transpose());
    };
    
    this.mul = function(that) {

        var thisTensor = this.getTensor();
        var thatTensor = dl.cast(that.getTensor(), thisTensor.dtype);

        if(thatTensor.rankType == "0") {
            return new ma.dl.vector(thisTensor.mul(thatTensor));
        }

        if(thatTensor.rankType == "2" && thisTensor.shape[0] == 1 && thatTensor.shape[1] == 1) {
            return new ma.dl.scalar(thisTensor.matMul(thatTensor));
        }

        if(thatTensor.rankType == "2" && (thisTensor.shape[0] == 1 || thatTensor.shape[1] == 1)) {
            return new ma.dl.vector(thisTensor.matMul(thatTensor));
        }

        return new ma.dl.matrix(thisTensor.matMul(thatTensor));
    };
    
    this.add = function(object) {
        return new ma.dl.vector(this.getTensor().add(object.getTensor()));
    };
    
    this.sub = function(object) {
        return new ma.dl.vector(this.getTensor().sub(object.getTensor()));
    };

    this.print = function() {
        return this.getTensor().print();
    }
    
    this.toArray = function() {
        return this.getTensor().dataSync();
    };
};
ma.dl.matrix = function(matrix) {

    ma.dl.call(this, matrix.rankType ? matrix : dl.tensor2d(matrix));
         
    this.shape = function(dim) {

        if(dim == 0) return this.getTensor().shape[0];
        if(dim == 1) return this.getTensor().shape[1];
        
        return this.getTensor().shape;
    };
    
    this.div = function(den) {
        return new ma.dl.matrix(this.getTensor().div(den.getTensor()));
    }

    this.mul = function(that) {        
        
        var thisTensor = this.getTensor();
        var thatTensor = dl.cast(that.getTensor(), thisTensor.dtype);

        if(thatTensor.rankType == "0") {
            return new ma.dl.matrix(thisTensor.mul(thatTensor));
        }
        
        if(thatTensor.rankType == "2" && thatTensor.shape[1] == 1) {
            return new ma.dl.vector(thisTensor.matMul(thatTensor));
        }
        
        return new ma.dl.matrix(thisTensor.matMul(thatTensor));
    };
    
    this.exp = function() {
        return new ma.dl.matrix(this.getTensor().exp());
    }
    
    this.pow = function(exp) {
        return new ma.dl.matrix(this.getTensor().pow(dl.scalar(exp)));
    }
    
    this.trn = function() {
        return new ma.dl.matrix(this.getTensor().transpose());
    }
    
    this.col = function(index) {
        return new ma.dl.vector(this.getTensor().slice([0,index],[this.shape(0),1]));
    }
    
    this.print = function() {
        return this.getTensor().print();
    }
    
};