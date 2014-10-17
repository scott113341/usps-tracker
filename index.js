'use strict';

var request = require('request');
var cheerio = require('cheerio');
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
  "9410 8036 9930 0060 6496 78 (Sequence Number 1 of 1)\n" +
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

var trackingNumbers = [];
var lines = inputString.split("\n");
lines.forEach(function(line, i) {
  var number_regex = /\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{2}/;
  var result = number_regex.exec(line);

  if (result) {
    trackingNumbers.push(result[0]);
  }
});
console.log(trackingNumbers);



/*
  get tracking information from usps
 */
var completedRequests = 0;

trackingNumbers.forEach(function(trackingNumber) {
  var url = 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=' + trackingNumber.split(' ').join('');
  console.log(url);

  request(url, function(error, response, body) {
    completedRequests = completedRequests + 1;
    console.log(completedRequests + ' completed requests');

    var outputLine;
    var deliveryStatus;

    if (error) {
      deliveryStatus = 'Request error!';
    }
    else {
      deliveryStatus = 'parsing html';

      var $ = cheerio.load(body);
      deliveryStatus = $('p.info-text.first').first().text().trim();
    }

    outputLine = [trackingNumber, deliveryStatus];
    outputArray.push(outputLine);

    if (completedRequests === trackingNumbers.length) {
      console.log('all requests done, writing csv');
      writeCSV();
    }
  });
});



/*
  write results to output.csv file
 */

var writeCSV = function() {
  console.log('outputArray', outputArray);

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
};
