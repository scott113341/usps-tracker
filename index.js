'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    csv = require('csv'),
    fs = require('fs');



/*
  set up input and output
 */

var inputString = '';

var outputArray = [[
  'Tracking Number',
  'Status',
  'Status Date',
  'Signed By'
]];



/*
  read input.txt
 */

fs.readFile('input.txt', 'utf8', function(err, data) {
  if (err) {
    console.log(err);
  }

  inputString = data;
  parseInput();
});



/*
  parse input and get tracking numbers
 */

var trackingNumbers = [];

var parseInput = function() {
  var lines = inputString.split("\n");
  lines.forEach(function(line, i) {
    var number_regex = /\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{2}/;
    var result = number_regex.exec(line);

    if (result) {
      trackingNumbers.push(result[0]);
    }
  });

  getTrackingInfo();
};



/*
  get tracking information from usps
 */

var getTrackingInfo = function() {
  var completedRequests = 0;

  trackingNumbers.forEach(function(trackingNumber) {
    var url = 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=' + trackingNumber.split(' ').join('');

    request(url, function(err, response, body) {
      completedRequests = completedRequests + 1;
      console.log('Completed request ' + completedRequests + ' of ' + trackingNumbers.length);

      var outputLine = [];
      var status = '';
      var statusDate = '';
      var signedBy = '';

      if (err) {
        status = 'Request error!';
      }
      else {
        var $ = cheerio.load(body);

        // get status
        status = $('p.info-text.first').first().text().trim();

        // get status date
        statusDate = $('tr.latest-detail td.date-time p').text().trim();
        var statusDateRegex = /.+ \d{4}/;
        var result = statusDateRegex.exec(statusDate);
        statusDate = result[0];

        // get signed by
        signedBy = $('div.detailed-info').first().text().trim();
        var signedByRegex = /signed for by (.+)\./;
        result = signedByRegex.exec(signedBy);
        signedBy = result[1];
      }

      outputLine = [trackingNumber, status, statusDate, signedBy];
      outputArray.push(outputLine);

      if (completedRequests === trackingNumbers.length) {
        console.log('all requests done, writing csv');
        writeCSV();
      }
    });
  });
};



/*
  write results to output.csv file
 */

var writeCSV = function() {
  console.log('outputArray', outputArray);

  csv.stringify(outputArray, function(err, data) {
    fs.writeFile('output.csv', data, function(err) {
      if(err) {
        console.log(err);
      }
      else {
        console.log('output.csv saved!');
      }
    });
  });
};
