// global.fps = 0;
// global.fpsTarget = 60;
// global.delay = 0;
// global.fillSize = 100;
//
// setInterval(() => {
//   const _fps = fps;
//   fps = 0;
//   console.log(`${_fps} - ${delay}`);
// }, 1000);
//
// function someWork() {w
//   new Array(Math.floor(Math.random() * 1000000) + 100).fill(1);
// }
//
// global.tick = function tick() {
//   fps++;
//   const start = Date.now();
//   someWork();
//   delay = Math.floor((1000 / (fpsTarget + 5)) - (Date.now() - start));
//
//   if (delay < 1) {
//     process.nextTick(() => tick());
//   } else {
//     setTimeout(() => tick(), delay);
//   }
// };
//
// tick();

// // ---------------------
// //      SAMPLE DATA
// // ---------------------
//
// const loadedData = [
//   {
//     0: {
//       Ticket: '123',
//       Mid: '987654321',
//     },
//   },
//   {
//     0: {
//       Ticket: '567',
//       Mid: '12345678',
//     },
//   },
// ];
//
// const newData = [
//   {
//     Ticket: '123',
//     Mid: '987654321',
//   },
//   {
//     Ticket: '345',
//     Mid: '54568656',
//   },
// ];
//
//
// // -----------
// //    UTILS
// // ------------
// /**
//  *
//  * @param obj
//  * @param keys
//  * @return {string}
//  */
// function objectToMapKey(obj, keys) {
//   let mapKey = '';
//
//   for (let j = 0, klen = keys.length; j < klen; j++) {
//     const key = keys[j];
//     if (obj[key]) {
//       if (j > 0) mapKey += '-' + obj[key];
//       else mapKey += obj[key];
//     }
//   }
//
//   return mapKey;
// }
//
// /**
//  *
//  * @param array
//  * @param keys
//  * @return {{}}
//  */
// function arrayToLookupMap(array, keys) {
//   const map = {};
//
//   for (let i = 0, len = array.length; i < len; i++) {
//     const item = array[i];
//     const mapKey = objectToMapKey(item, keys);
//     map[mapKey] = Object.assign({}, item);
//   }
//
//   return map;
// }
//
// // -----------------
// //    actual code
// // -----------------
//
// const lookupFields = ['Ticket', 'Mid'];
// const lookupMap = arrayToLookupMap(loadedData, lookupFields);
//
// for (let i = 0, len = newData.length; i < len; i++) {
//   const newObj = newData[i];
//   const lookupKey = objectToMapKey(newObj, lookupFields);
//   const exists = lookupMap[lookupKey];
//
//   if (exists) {
//     // exists in loaded and loaded data is: console.log(exists);
//     console.log('Item ' + lookupKey + ' exists!');
//     // TODO ignore as exists?
//   } else {
//     // doesn't exist in loaded data
//     console.log('Item ' + lookupKey + ' does NOT exist!');
//     // TODO do something as doesn't exist?
//   }
// }

// // top of file - in your imports
// const vm = require('vm'); // part of node api - don't  npm install it
// // also top of your file
// const start = "$(document).find('#flot-chart'),"; // where the js code to extract starts after
// const end = '$.plot('; // where the js code to extract end
//
// // your actual code:

// const html = "<div class=\"js-modal modal fade\" id=\"simpleModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"simpleModalLabel\" aria-hidden=\"true\">\n    <div class=\"modal-dialog modal-lg\">\n        <div class=\"modal-content\">\n            <div class=\"modal-header\">\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;<\/button>\n                <h4 class=\"modal-title\" id=\"simpleModalLabel\">BSR and price history<\/h4>\n            <\/div>\n            <div class=\"modal-body\">\n                            <table class=\"table media-middle center-table\">\n            <thead>\n                <tr>\n                    <th>Product<\/th>\n                    <th>ASIN<\/th>\n                <\/tr>\n            <\/thead>\n            <tbody>\n                <tr>\n                    <td>\n                        <div>\n                            <img src=\"https:\/\/images-na.ssl-images-amazon.com\/images\/I\/417tmo2tsvL.jpg\" class=\"img-circle width-4\" alt=\"\">\n                        <\/div>\n                                                    <p>\n                                <a class=\"text-primary\" target=\"_blank\" href=\"https:\/\/www.amazon.com\/Columbia-SC-Total-Solar-Eclipse\/dp\/B074CWR5RC\">Columbia, SC Total Solar Eclipse 2:41 pm Viewing T-Shirt<\/a>\n                            <\/p>\n                                            <\/td>\n                    <td>\n                        <p>B074CWR5RC<\/p>\n                    <\/td>\n                <\/tr>\n            <\/tbody>\n        <\/table>\n                    <div id=\"flot-chart\" class=\"flot\" style=\"height: 450px; width: 90%; margin: 10px auto 40px;\"><\/div>\n                        <\/div>\n            <div class=\"modal-footer\">\n                    <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">Close<\/button>\n            <script>\n            function formatPrice(v) {\n                v = parseInt(Math.round(v));\n                var dollars = parseInt(v \/ 100),\n                    cents = parseInt(v % 100);\n                return '$' + dollars + '.' + cents;\n            }\n\n            (function() {\n                var chart = $(document).find('#flot-chart'),\n                    sales_ranks = [\n                                                    [1505828811000, 1410763],\n                                                    [1505743380000, 1362660],\n                                                    [1505742461000, 1362660],\n                                                    [1505656097000, 1309475],\n                                                    [1505656097000, 1309475],\n                                                    [1505570650000, 1265811],\n                                                    [1505569696000, 1265811],\n                                                    [1505483259000, 1219500],\n                                                    [1505397866000, 1173587],\n                                                    [1505396882000, 1173587],\n                                                    [1505225244000, 1092860],\n                                                    [1505224069000, 1092860],\n                                            ],\n                    prices = [\n                                                    [1505828811000, 1799],\n                                                    [1505743380000, 1799],\n                                                    [1505742461000, 1799],\n                                                    [1505656097000, 1799],\n                                                    [1505656097000, 1799],\n                                                    [1505570650000, 1799],\n                                                    [1505569696000, 1799],\n                                                    [1505483259000, 1799],\n                                                    [1505397866000, 1799],\n                                                    [1505396882000, 1799],\n                                                    [1505225244000, 1799],\n                                                    [1505224069000, 1799],\n                                            ];\n\n                $.plot(\n                    chart,\n                    [\n                        {data: sales_ranks, label: 'Sales rank'},\n                        {data: prices, label: 'Price', yaxis: 2}\n                    ],\n                    {\n                        colors: ['#9C27B0', '#0aa89e'],\n                        series: {\n                            shadowSize: 0,\n                            lines: {\n                                show: true,\n                                lineWidth: 2\n                            },\n                            points: {\n                                show: true,\n                                radius: 3,\n                                lineWidth: 2\n                            }\n                        },\n                        legend: {\n                            position: 's'\n                        },\n                        xaxis: {\n                            mode: \"time\",\n                            timeformat: \"%b %d\",\n                            color: 'rgba(0, 0, 0, 0)',\n                            font: {color: '#222'}\n                        },\n                        yaxis: {\n                            font: {color: '#222'}\n                        },\n                        grid: {\n                            borderWidth: 0,\n                            color: '#222',\n                            hoverable: true\n                        },\n                        yaxes: [\n                            {\n                                alignTicksWithAxis: 1,\n                                min: 0,\n                                position: 'left',\n                                tickFormatter: function(v, axis) {\n                                    v = parseInt(v);\n                                    v = v.toFixed(2);\n                                    if (v >= 1000000) {\n                                        v = v \/ 1000000 + 'M';\n                                    } else if (v >= 1000) {\n                                        v = v \/ 1000 + 'K'\n                                    }\n\n                                    return v;\n                                }\n                            },\n                            {\n                                alignTicksWithAxis: 1,\n                                min: 0,\n                                position: 'right',\n                                tickFormatter: function(v, axis) {\n                                    return formatPrice(v);\n                                }\n                            }\n                        ]\n                    }\n                );\n\n                var tip, previousPoint = null;\n                chart.bind(\"plothover\", function (event, pos, item) {\n                    console.log(item);\n                    if (item) {\n                        if (previousPoint !== item.dataIndex) {\n                            previousPoint = item.dataIndex;\n\n                            var x = item.datapoint[0];\n                            var y = (item.seriesIndex == 0 ? item.datapoint[1] : formatPrice(item.datapoint[1]));\n                            var tipLabel = '<strong>' + (item.seriesIndex == 0 ? 'Sales rank' : 'Price') + '<\/strong>';\n                            var tipContent = y + \" on \" + moment(x).format('MMM DD');\n\n                            if (tip !== undefined) {\n                                $(tip).popover('destroy');\n                            }\n                            tip = $('<div><\/div>').appendTo('body').css({left: item.pageX, top: item.pageY - 5, position: 'absolute'});\n                            tip.popover({html: true, title: tipLabel, content: tipContent, placement: 'top'}).popover('show');\n                        }\n                    }\n                    else {\n                        if (tip !== undefined) {\n                            $(tip).popover('destroy');\n                        }\n                        previousPoint = null;\n                    }\n                });\n            })();\n        <\/script>\n                <\/div>\n        <\/div><!-- \/.modal-content -->\n    <\/div><!-- \/.modal-dialog -->\n<\/div>";
//
// // extract the js out and execute it safely in a sandbox
// if (html.indexOf(start) === -1 || html.indexOf(end) === -1) {
//   // uh-oh no js code data found - skip?
// }
// const script = new vm.Script(html.substring(html.indexOf(start) + start.length, html.indexOf(end)));
// const context = new vm.createContext(script);
// script.runInContext(context);
//
// // data is now in context
// // console.log(context.sales_ranks);
// // console.log(context.prices);
//
// const average = context.sales_ranks.slice(0, 5).reduce((a, b) => a[1] || 0 + b[1]) / 5;
//
// console.log(average);
//

// @flow
import INTERNALS from './../../internals';
import { generatePushID, isFunction } from './../../utils';

export default class PhoneAuthListener {
  _auth: Object;
  _codeSentEvent: string;
  _verificationCompleteEvent: string;
  _verificationFailedEvent: string;

  /**
   *
   * @param auth
   * @param phoneNumber
   */
  constructor(auth: Object, phoneNumber: string) {
    const phoneAuthRequestKey = generatePushID();
    this._auth = auth;
    this._codeSentEvent = `phone:auth:${phoneAuthRequestKey}:onCodeSent`;
    this._verificationCompleteEvent = `phone:auth:${phoneAuthRequestKey}:onVerificationComplete`;
    this._verificationFailedEvent = `phone:auth:${phoneAuthRequestKey}:onVerificationFailed`;

    // start verification flow
    this._native.verifyPhoneNumber(
      phoneNumber,
      phoneAuthRequestKey,
    );
  }

  /**
   *
   * @param cb
   * @return {*}
   */
  onCodeSent(cb: string => void): PhoneAuthListener {
  if (!isFunction(cb)) {
  throw new Error(INTERNALS.STRINGS.ERROR_MISSING_CB('onCodeSent'));
}

this._auth.once(codeSentEvent, (authCode) => {
  cb(authCode);
  this._auth.removeAllListeners(verificationCompleteEvent);
  this._auth.removeAllListeners(verificationFailedEvent);
});

return this;
}

/**
 *
 * @param cb
 * @return {*}
 */
onVerificationComplete(cb: Object => void): PhoneAuthListener => {
  if (!isFunction(cb)) {
    throw new Error(INTERNALS.STRINGS.ERROR_MISSING_CB('onVerificationComplete'));
  }

  this.once(verificationCompleteEvent, (credential) => {
    cb(credential);
    this._auth.removeAllListeners(codeSentEvent);
    this._auth.removeAllListeners(verificationFailedEvent);
  });

  return this;
}

/**
 *
 * @param cb
 * @return {*}
 */
onVerificationFailed(cb: Error => void): PhoneAuthListener => {
  if (!isFunction(cb)) {
    throw new Error(INTERNALS.STRINGS.ERROR_MISSING_CB('onVerificationFailed'));
  }

  this._auth.once(verificationFailedEvent, (error) => {
    cb(error);
    this._auth.removeAllListeners(codeSentEvent);
    this._auth.removeAllListeners(verificationCompleteEvent);
  };

  return this;
}
}


