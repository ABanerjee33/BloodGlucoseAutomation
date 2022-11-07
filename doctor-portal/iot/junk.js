var http = require("https");

var options = {
  "method": "POST",
  "hostname": "hackmit2021-backend.azurewebsites.net",
  "port": 443,
  "path": "/glucose/1/150",
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();