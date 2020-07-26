// const functions = require("firebase-functions");
const express = require("express");
const http = require("http");
const https = require("https");
const bodyParser = require("body-parser");

var app = express();
app.use(express.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 8000;
const checksum_lib = require("./checksum.js");
const qs = require("querystring");
//Production
var PaytmConfig = {
  mid: "veoqbc86051763263258",
  key: "snC4rbr!&3O2Si2L",
  website: "DEFAULT",
};
// var PaytmConfig = {
//   mid: "kNtgaT45608268713617",
//   key: "PomAslqDyuOlN6XT",
//   website: "WEBSTAGING",
// };

// var txn_url = "https://securegw-stage.paytm.in/order/process"; // for staging

var txn_url = "https://securegw.paytm.in/order/process"; //production

var callbackURL = "http://localhost:8000/callback";

//CORS ACCESS CONTROL
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("<h5>Hello World</h5>");
});
app.get("/payment", (req, res) => {
  var params = {};
  params["MID"] = PaytmConfig.mid;
  params["WEBSITE"] = PaytmConfig.website;
  params["CHANNEL_ID"] = "WEB";
  params["INDUSTRY_TYPE_ID"] = "Retail";
  params["ORDER_ID"] = "TEST_" + new Date().getTime();
  params["CUST_ID"] = "Customer001";
  params["TXN_AMOUNT"] = "1.00";
  params["CALLBACK_URL"] = "http://localhost:8000/callback";
  params["EMAIL"] = "abc@mailinator.com";
  params["MOBILE_NO"] = "7777777777";

  checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {
    // var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
    var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

    var form_fields = "";
    for (var x in params) {
      form_fields +=
        "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
    }
    form_fields +=
      "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

    // res.writeHead(200, { "Content-Type": "text/html" });
    return res.send(
      '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
        txn_url +
        '" name="f1">' +
        form_fields +
        '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
    );

    // return;
  });
});

app.post("/callback", (req, res) => {
  const callbackResponse = req.body;
  console.log(callbackResponse);
  var checksumhash = callbackResponse.CHECKSUMHASH;
  var result = checksum_lib.verifychecksum(
    callbackResponse,
    PaytmConfig.key,
    checksumhash
  );
  var params = { MID: PaytmConfig.mid, ORDERID: callbackResponse.ORDERID };
  return res.send(req.body);
});

var server = http.createServer(app);
server.listen(8000);
