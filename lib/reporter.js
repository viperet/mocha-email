var Spec = require('mocha').reporters.spec;
var inherits = require('mocha').utils.inherits;
var request = require('request');
var nodemailer = require('nodemailer');
var sprintf = require('sprintf-js').sprintf;

exports = module.exports = EmailReporter;

function EmailReporter(runner, options) {

    Spec.call(this,runner)

    var passes = 0;
    var passedTests = [];
    var failures = 0;
    var failedTests = [];

    runner.on('pass', function(test) {
        passes++;
        passedTests.push(test);
    });

    runner.on('fail', function(test, err) {
        failures++;
        failedTests.push(test);
    });

    runner.on('end', function() {
        var errors = '';
        var mailOptions = options.reporterOptions.mailOptions;

        failedTests.forEach(function(failedTest) {
            errors += options.reporterOptions.formatter(failedTest, mailOptions);
        });

        var results = {
            total: passes + failures,
            passed: passes,
            failed: failures
        }

        if(mailOptions.subject_success && failures == 0) {
            mailOptions.subject = sprintf(mailOptions.subject_success, results);
        } else if(mailOptions.subject_fail && failures > 0) {
            mailOptions.subject = sprintf(mailOptions.subject_fail, results);
        } else if(!mailOptions.subject) {
            mailOptions.subject = 'Test results';
        }


        mailOptions.html += '<p>' + passes + ' of ' + (passes + failedTests.length) + ' tests have passed</p>';
        if(failures > 0) {
            mailOptions.html += '<p>The following tests have failed : </p>' + errors;
        }

        mailOptions.html += '</body>';

        var transporter = nodemailer.createTransport(options.reporterOptions.transporterOptions);

        transporter.sendMail(mailOptions, function(error, info){

            if(error){
                console.log(error);
            }

            transporter.close();
        });
    });
};

inherits(EmailReporter, Spec);