'use strict';

var csv = require('csv');
var fs = require('fs');



/*
  set up input and output
 */

var inputString = "" +
  "9410 8036 9930 0060 6497 77 (Sequence Number 1 of 1)\n" +
  "Some random address line blah\n" +
  "Some random address line blah\n" +
  "Some random address line blah\n" +
  "Some random address line blah\n" +
  "9410 8036 9930 0060 6497 78 (Sequence Number 1 of 1)\n" +
  "Some random address line blah\n" +
  "Some random address line blah\n" +
  "Some random address line blah\n" +
  "Some random address line blah\n";

var outputArray = [[
  'Tracking Number',
  'Delivered?'
]];



/*
  parse input and get tracking numbers
 */

var lines = inputString.split("\n");
lines.forEach(function(line, i) {
  var number_regex = /\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{2}/;
  var result = number_regex.exec(line);

  if (result) {
    var outputLine = [result[0], 'Not yet known'];
    outputArray.push(outputLine);
  }
});
console.log('outputArray', outputArray);



/*
  write results to output.csv file
 */

csv.stringify(outputArray, function(err, data) {
  fs.writeFile("output.csv", data, function(err) {
    if(err) {
      console.log(err);
    }
    else {
      console.log('output.csv saved!');
    }

    console.log('program finished');
  });
});
