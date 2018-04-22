var express = require('express');
var router = express.Router();

var Lcs = require('../logic/lcs');

// const
const { performance } = require('perf_hooks');

/* POST values for LCS calculation. */
router.post('/lcs', function(req, res, next){
  var t1 = performance.now(); // determine start time
  // convert JSON body to array
  try {
  var arrObj = Lcs.objToArray(req.body);

  if (arrObj && arrObj.ret) { //error occurred
    res.status(arrObj.httpCode).send(arrObj.message);
  }
  else {
    // input seems good, proceed
    var ans = Lcs.find(arrObj);

    if (ans && ans.ret < 0){
      // error occurred
      res.status(ans.httpCode).send(ans.message);
    }
    else if (ans && ans.ret === 0){
      // success
      res.send({lcs: ans.values});
    }
    else {
      // unknown situation, inform caller
      res.status(500).send("Unknown error occurred.");
    }
  }
  }
  catch (err){
    res.status(500).send(err.message);
  }
  // determine end time
  var t2 = performance.now();
  console.log("Lcs process took " + (t2 - t1) + " milliseconds.");
});

module.exports = router;
