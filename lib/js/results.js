// This gets the selected links from the eventPage, checks the redirects and calls out any validation errors.
/*jslint node: true */
'use strict';

var selectedLinks = [],
    filtLinks = [],
    noimg = '<i class="fa fa-ban" aria-hidden="true" style="font-size:15px;vertical-align:1px"></i>',
    errorimg = '<i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i>',
    warnimg = '<i class="fa fa-exclamation-triangle" aria-hidden="true" style="font-size:12px;vertical-align:1px"></i>',
    errormessage = '',
    errcount = 0,
    warncount = 0;

// Add Error function
//**********************************************
function addError() {
  errcount = document.getElementsByClassName('warn').length;
  warncount = document.getElementsByClassName('warning').length;
  errcount = ((errcount - warncount)-1)/2;
  if (errcount > 0) {
    document.getElementById('errors-total').innerHTML = (errcount == 1) ? errcount + ' Error' : errcount + ' Errors';
    document.getElementById('errors-total').className = 'warn';
  }
}
function addWarning() {
  warncount = document.getElementsByClassName('warning').length;
  warncount = (warncount - 1) / 2;
  if (warncount > 0) {
    document.getElementById('warnings-total').innerHTML = (warncount == 1) ? warncount + ' Warning' : warncount + ' Warnings';
    document.getElementById('warnings-total').className = 'warn warning';
  }
}

// Highlight function
//**********************************************
function highlight(url) {
  var highValue = document.getElementById('highlight').value.replace(/(\^)|(\\)|(\?)|(\.)|(\^)|(\$)|(\+)|(\|)|(\()|(\))|(\[)|(\])/g, function (all, first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh, twelvth) {
      var array = [first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh, twelvth], f;
      for (f = 0; f < array.length; f += 1) {
          if (array[f]) { return ('\\' + array[f]); }
      }
  });
    if (highValue) {
        highValue = new RegExp('(' + highValue + ')', 'ig');
        url = url.replace(/<span class="hlt">(.*?)<\/span>/ig, '$1');
        url = url.replace(highValue, '<span class="hlt">$1</span>');
    }
    return url;
}

// Syntax Validation function
//**********************************************
function validate(str) {
    if (/(\?.*?)(\?)/ig.test(str)) {
        str = str.replace(/(\?.*?)(\?)/ig, '$1<span class="warn" id="time">$2<span class="warn tooltip" content="There should never be more than one question mark in a query string."></span></span>');
        str = str.replace('&#8618;', errorimg);
    }
    if (/(#.*?)(\?|&)/ig.test(str)) {
        str = str.replace(/(#.*?)(\?|&)/ig, '<span class="warn" id="time">$1<span class="warn tooltip" content="Fragments (jump links) should always be at the end of a query string."></span></span>$2');
        str = str.replace('&#8618;', errorimg);
    }
    if (/^(http[^\?]*?)(&)/i.test(str)) {
        str = str.replace(/^(http[^\?]*?)(&)/i, '$1<span class="warn" id="time">$2<span class="warn tooltip" content="The query string is missing an opening question mark."></span></span>');
    }
    return str;
}

// Error Codes
//**********************************************
function errCodes(x) {
  switch(x) {
    case 0:
      errormessage = 'The DNS did not resolve this domain name.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> DNS Address Not Found';
      break;
    case 400:
      errormessage = 'The server cannot or will not process the request due to an apparent client error.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 400 Bad Request';
      break;
    case 401:
      errormessage = 'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 401 Unauthorized';
      break;
    case 402:
      errormessage = 'The original intention was that this code might be used as part of some form of digital cash or micropayment scheme, but that has not happened, and this code is not usually used. Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 402 Payment Required';
      break;
    case 403:
      errormessage = 'The request was a valid request, but the server is refusing to respond to it.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 403 Forbidden';
      break;
    case 404:
      errormessage = 'The requested resource could not be found but may be available in the future.';
      errorimg = '<span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 404 Not Found';
      break;
    case 405:
      errormessage = 'A request method is not supported for the requested resource.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 405 Method Not Allowed';
      break;
    case 406:
      errormessage = 'The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 406 Not Acceptable';
      break;
    case 407:
      errormessage = 'The client must first authenticate itself with the proxy.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 407 Proxy Authentication Required';
      break;
    case 408:
      errormessage = 'The server timed out waiting for the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 408 Request Timeout';
      break;
    case 409:
      errormessage = 'Indicates that the request could not be processed because of conflict in the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 409 Conflict';
      break;
    case 410:
      errormessage = 'Indicates that the resource requested is no longer available and will not be available again.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 410 Gone';
      break;
    case 411:
      errormessage = 'The request did not specify the length of its content, which is required by the requested resource.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 411 Length Required';
      break;
    case 412:
      errormessage = 'The server does not meet one of the preconditions that the requester put on the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 412 Precondition Failed';
      break;
    case 413:
      errormessage = 'The request is larger than the server is willing or able to process.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 413 Payload Too Large';
      break;
    case 414:
      errormessage = 'The URI provided was too long for the server to process.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 414 URI Too Long';
      break;
    case 415:
      errormessage = 'The request entity has a media type which the server or resource does not support.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 415 Unsupported Media Type';
      break;
    case 416:
      errormessage = 'The client has asked for a portion of the file (byte serving), but the server cannot supply that portion.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 416 Range Not Satisfiable';
      break;
    case 417:
      errormessage = 'The server cannot meet the requirements of the Expect request-header field.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 417 Expectation Failed';
      break;
    case 418:
      errormessage = 'This code was defined in 1998 as one of the traditional IETF April Fools\' jokes, in RFC 2324.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 418 I\'m a teapot';
      break;
    case 421:
      errormessage = 'The request was directed at a server that is not able to produce a response.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 421 Misdirected Request';
      break;
    case 422:
      errormessage = 'The request was well-formed but was unable to be followed due to semantic errors.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 422 Unprocessable Entity';
      break;
    case 423:
      errormessage = 'The resource that is being accessed is locked.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 423 Locked';
      break;
    case 424:
      errormessage = 'The request failed due to failure of a previous request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 424 Failed Dependency';
      break;
    case 426:
      errormessage = 'The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 426 Upgrade Required';
      break;
    case 428:
      errormessage = 'The origin server requires the request to be conditional.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 428 Precondition Required';
      break;
    case 429:
      errormessage = 'The user has sent too many requests in a given amount of time.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 429 Too Many Requests';
      break;
    case 431:
      errormessage = 'The server is unwilling to process the request because it is too large.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 431 Request Header Fields Too Large';
      break;
    case 451:
      errormessage = 'A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 451 Unavailable For Legal Reasons';
      break;
    case 500:
      errormessage = 'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 500 Internal Server Error';
      break;
    case 501:
      errormessage = 'The server either does not recognize the request method, or it lacks the ability to fulfill the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 501 Not Implemented';
      break;
    case 502:
      errormessage = 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 502 Bad Gateway';
      break;
    case 503:
      errormessage = 'The server is currently unavailable.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 503 Service Unavailable';
      break;
    case 504:
      errormessage = 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 504 Gateway Timeout';
      break;
    case 505:
      errormessage = 'The server does not support the HTTP protocol version used in the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 505 HTTP Version Not Supported';
      break;
    case 506:
      errormessage = 'Transparent content negotiation for the request results in a circular reference.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 506 Variant Also Negotiates';
      break;
    case 507:
      errormessage = 'The server is unable to store the representation needed to complete the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 507 Insufficient Storage';
      break;
    case 508:
      errormessage = 'The server detected an infinite loop while processing the request.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 508 Loop Detected';
      break;
    case 510:
      errormessage = 'Further extensions to the request are required for the server to fulfil it.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 510 Not Extended';
      break;
    case 511:
      errormessage = 'A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 511 Network Authentication Required';
      break;
    default:
      errormessage = 'The server returned an unknown error code.';
      errorimg = ' <span id="time" class="warn"><i class="fa fa-times-circle-o" aria-hidden="true" style="font-size:14px;vertical-align:1px"></i><span class="warn tooltip" content="'+ errormessage +'"></span></span> HTTP/1.1 ' + x + ' Unknown Server Error';
  }

}

// Build table for page
//**********************************************
function showLinks() {
    var linksTable = document.getElementById('links'), row, col0, resultString = '', i, z;

    // Clear Table
    while (linksTable.children.length > 0) {
        linksTable.removeChild(linksTable.children[linksTable.children.length - 1]);
    }

    for (i = 0; i < filtLinks.length; i += 1) {
        // Create table elements
        row = document.createElement('tr');
        col0 = document.createElement('td');

        resultString = '<span class="txt">' + filtLinks[i].text.replace(/display:block|display:none/ig, 'display:inline') + '</span><hr />' +
            '<p class="break"><span class="orig"><b>Original Link:</b> ' +
                highlight(validate(filtLinks[i].url)) + '</p></span>';

        if (/tel:|mailto:/ig.test(filtLinks[i].url)) {
            resultString += '<p style="margin:8px 0 0 0;font-weight:bold;padding-left:1em" class="orig">' +
                noimg + ' No Further Redirect</p>';
        } else if (typeof filtLinks[i].header === "undefined") {
            //resultString += '<br /><span style="color:#CCC;"><span class="spinthis">&#8635;</span> Loading..</span>';
            resultString += '<br /><div class="load-bar"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>';


        } else {
            var checkall = (document.getElementById('myonoffswitch').checked) ? filtLinks[i].header.data.length : 1;
            for (z = 0; z < checkall; z += 1) {
                if (typeof filtLinks[i].header.data[z] === "undefined" || typeof filtLinks[i].header.data[z].redirect_url === "undefined" || filtLinks[i].header.data[z].redirect_url === "") {
                    if (typeof filtLinks[i].header.data[z] === "undefined" || (parseInt(filtLinks[i].header.data[z].http_code) > 399) || (parseInt(filtLinks[i].header.data[z].http_code) < 99)) {
                        // If http_code is greater than 399, run error code function
                        errCodes(filtLinks[i].header.data[z].http_code);
                        resultString += '<p style="margin:8px 0 0 0;padding-left:' + ((z + 1)) + 'em" class="no">' +
                            errorimg + '</p>';
                    } else {
                        resultString += '<p style="margin:8px 0 0 0;font-weight:bold;padding-left:' + ((z + 1)) + 'em" class="orig">' +
                            noimg + ' No Further Redirect</p>';
                    }
                } else {
                    if (z > 0) {
                        resultString += '<p class="break" style="padding-left:' + ((z + 1)) + 'em"><span id="time" class="warn warning"><i class="fa fa-exclamation-triangle" aria-hidden="true" style="font-size:12px;vertical-align:1px"></i><span class="warn tooltip warning" content="Multiple redirects could be an indication of a URL issue."></span></span> <b>Redirects to:</b> ' + validate(highlight(filtLinks[i].header.data[z].redirect_url));
                    } else {
                        resultString += '<p class="break" style="padding-left:' + ((z + 1)) + 'em"><span class="hea">&#8618; Redirects to:</span> ' + validate(highlight(filtLinks[i].header.data[z].redirect_url));
                    }

                    resultString += ' &#160;<a target="_blank" href="' + filtLinks[i].header.data[z].redirect_url + '"><i class="fa fa-external-link" aria-hidden="true"></i></a></p>';
                }
            }
        }
        col0.innerHTML = resultString;

        // Alternating background color
        //row.className = (i % 2 === 0) ? 'rowa' : 'rowb';

        row.appendChild(col0);
        linksTable.appendChild(row);
        // Show table
        document.getElementById('loading').className = 'hide';
        linksTable.className = 'show';
        addError();
        addWarning();
    }
    //document.getElementById('showing').innerHTML = 'Showing ' + filtLinks.length + ' of ' + selectedLinks.length + '.';
}

// Filter functionality - Add text/url option
//**********************************************
function filterLinks() {
    var filterValue = new RegExp(document.getElementById('filter').value, 'ig');
    filtLinks = selectedLinks.filter(function (fil) {
        if (filterValue.test(fil.text) || filterValue.test(fil.header.data[0].response.info.redirect_url)) { return true; }
    });
    showLinks();
}

// Send links to eventPage to open in new tabs
//**********************************************
function openLinks() {
    var allLinks = {from: "openthis", allLinks: selectedLinks};
    chrome.runtime.sendMessage(allLinks);
}

// Get selected links from eventPage
//**********************************************
function setLinks(links) {
    selectedLinks = links;
    filtLinks = selectedLinks;
    showLinks();
    document.title = 'Redirect Results: ' + selectedLinks[0].title;
}

// Check preference and check option accordingly
//**********************************************
function preferenceCheck() {
  chrome.storage.sync.get({
    fullchain: true
  }, function(items) {
    document.getElementById('myonoffswitch').checked = items.fullchain;
  });
}

// Download Stuff
//**********************************************
function downloadResults() {
  var resTable = document.getElementById('links').innerHTML;
  var blob = new Blob(["<html><head><style>body {padding:20px;} a, a:hover {color:#000;} table, tr {border-collapse:collapse;border:2px solid #000;} td {padding:15px;} .hea {font-weight:bold;} .break {word-break:break-all;word-break:break-word;}</style></head><body><table>" + resTable + "</table></body></html>"], {type: "text/html;charset=utf-8"});
  saveAs(blob, "redirect-results.html");
}

window.onload = function () {
    preferenceCheck();
    //document.getElementById('filter').onkeyup = filterLinks;
    document.getElementById('highlight').onkeyup = showLinks;
    document.getElementById('myonoffswitch').onchange = showLinks;
    document.getElementById('openall').onclick = openLinks;
    document.getElementById('save').onclick = downloadResults;

    document.getElementById('copy').innerHTML = '&copy;' + new Date().getFullYear() + ' Tim Mullen';
};
