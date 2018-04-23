var http = require('http');

var options = {
    host: "localhost",
    port: 3000,
    path: "/lcs",
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    }
};

var tests = [
    { input: { values: [ { value: "ABAB"}, { value: "BABA"}]}, output: { lcs : [{value: "ABA"}, {value: "BAB"}]} }
];

var passed = true;

var promises = [];

function compareResults(expected, actual, statusCode) {
    if (typeof expected === "object"){
        if (statusCode >= 400){return false;} // error when not expecting it
        var objActual
        // try to parse actual to an object
        try {
            objActual = JSON.parse(actual);
            if (expected.lcs && objActual.lcs && Array.isArray(expected.lcs) && Array.isArray(objActual.lcs) &&
                expected.lcs.length === objActual.lcs.length){
                
                objActual.lcs.forEach(function(item) {
                    if (expected.lcs.indexOf(item) < 0){
                        return false; // missing a value we expected
                    }
                });
                return true; // seems like everything checks out
            }
        }
        catch(err){
            return false; // must be an error message or something
        }
    }
    else if (expected === "error"){
        if (statusCode >= 400){return true;}
        return false; 
    }
    return false; // something went wrong, assume failure so we can check it
}

tests.forEach(function(ele){
    let req = http.request(options, (function(res){
        res.setEncoding('utf8');
        this.statusCode = res.statusCode;
        res.on('data', (function (chunk){
             if (!this.actual)
             { this.actual = chunk; } 
             else 
             { this.actual+=chunk; } }).bind(this));
        res.on('end', (function() {
            var ans = compareResults(this.output, this.actual, this.statusCode);
            if (!ans){
                console.log("Failed test: ");
                console.log(JSON.stringify(this));
            }
            passed = passed && ans;
            this.processing = false;
        }).bind(this));
    }.bind(ele)));
    ele.processing = true;
    req.on('error', (function(e){
        var ans = compareResults(this.output, 'error');
        if (!ans){
            console.log("Failed test: ");
            console.log(JSON.stringify(this));
        }
        passed = passed && ans;
    }).bind(ele));
    req.write(JSON.stringify(ele.input));
    req.end();
});

var waitTimeout = null;
// wait for tests to finish
waitTimeout = setTimeout(testForCompletion, 500);

function testForCompletion() {
    clearTimeout(waitTimeout);
    let wait = false;
    tests.forEach(function(j){
        if (j.processing !== false){
            wait = true;
            return false;
        }
    });
    if (wait){
        waitTimeout = setTimeout(testForCompletion, 500);
    }
    else { processResults(); }
}

function processResults() {
    if (passed){
        console.log("Tests passed!");
        return 0;
    }
    else {
        console.log("One or more tests failed.");
        return -1;
    }
}