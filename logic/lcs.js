

// private 
function lcs(x,y){
    if (x.length === 0 || y.length === 0)
        return '';

    var L = new Array(x.length),
        z = 0,
        ret = [];
    for (var i = 0; i <x.length; i++){
        for (var j=0; j < y.length; j++){
            if (j===0){
                L[i] = new Array(y.length);
            }
            if (x[i] === y[j]){
                if (i === 0 || j === 0) {
                    L[i][j] = 1;
                }
                else {
                    L[i][j] = L[i-1][j-1] + 1;
                }

                if(L[i][j] > z){
                    z = L[i][j];
                    ret = [x.substring(i-z+1, i+1)];
                }
                else if (L[i][j] == z){
                    ret.push(x.substring(i-z+1, i+1))
                }
            }
            else { L[i][j] = 0; }
        }
    }

    return ret;
}

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

// Ctor
function Lcs() {}

Lcs.prototype.objToArray = function(obj) {
    if (!obj || !obj.values || !Array.isArray(obj.values)) {
        return { ret: -3, httpCode: 400, message: 'Request format not acceptable. Input should be a JSON object in the format: { "values": [{"value":"str1"}, {"value":"str2"}] }'};
    }
    if (obj.values == '' || obj.values.length === 0){

        return { ret: -4, httpCode: 400, message: 'The "values" parameter must not be empty.'};
    }
    return obj.values.map(function(val){
        return val.value;
    });
};

Lcs.prototype.find = function(arr){
    if (arr.length < 2){
        return { ret: -1, httpCode: 400,  message: "Invalid number of values. Need at least 2 values to compare."};
    }

    if (hasDuplicates(arr)){
        return {ret: -2, httpCode: 400, message: 'The "values" parameter must be a set.'};
    }
    
    var answers = [], 
        temp = [], 
        temp1;
        
    
    // calculate lcs() for first two strings
    answers = lcs( arr[0], arr[1]);
    
    // if we have more than two strings and we found an lcs(), keep going
    if (arr.length > 2 && answers.length > 0) {
      // iterate over answers from first two as input for subsequent lcs() calls
      for(var i = 2; i < arr.length && answers.length > 0; i++) {
        temp = []; // reset potential answers for each new string
        do {
          // pop off the first answer from previous round and lcs() with next arg string
          temp1 = lcs(answers.pop(), arr[i]);

          if (temp1.length > 0){ // if we found any answers
            // if this our first time with this arg string or if we found longer lcs() than previously, save it
            if (temp.length === 0 || temp[0].length < temp1[0].length) {
                temp = temp1;
            }
            // otherwise if these answers are same length, append them
            else if (temp.length > 0 && temp[0].length === temp1[0].length) {
                temp = temp.concat(temp1);
            }
          }
        } while (answers.length > 0); // use up all the answers
        answers = temp; // save whatever we found for next iteration or return
      }
    }
    
    // remove duplicate answers:
    answers = Array.from(new Set(answers));
    
    return { ret: 0, values : answers.map(function(val){ return { value: val }; }) };
};

module.exports = new Lcs();