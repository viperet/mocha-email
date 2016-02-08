var Spec = require('mocha').reporters.spec;
var inherits = require('mocha').utils.inherits;
var request = require('request');
var nodemailer = require('nodemailer');

exports = module.exports = EmailReporter;

function EmailReporter(runner, options) {

    Spec.call(this,runner)

    var passes = 0;
    var failures = 0;
    var failedTests = [];

    runner.on('pass', function(test) {
        passes++;
    });

    runner.on('fail', function(test, err) {
        failures++;
        failedTests.push(test);
    });

    runner.on('end', function() {

        if (failedTests.length > 0) {

            var errors = '';

            failedTests.forEach(function(failedTest) {
                errors += options.reporterOptions.formatter(failedTest);
            });

            var mailOptions = options.reporterOptions.mailOptions;
            mailOptions.html += '<p>' + passes + ' of ' + (passes + failedTests.length) + ' tests have passed</p>' +
                                '<p>The following tests have failed : </p>' + errors + '</body>';

            var transporter = nodemailer.createTransport(options.reporterOptions.transporterOptions);

            transporter.sendMail(mailOptions, function(error, info){

                if(error){
                    console.log(error);
                }

                transporter.close();
                process.exit(failures);

            });

        }

    });
};

inherits(EmailReporter, Spec);