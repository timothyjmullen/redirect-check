// Copyright (c) 2015 Tim Mullen. All rights reserved.
// This gets the selected links from the eventPage, checks the redirects and calls out any validation errors.
/*jslint node: true */
'use strict';

var selectedLinks = [],
    filtLinks = [],
    noimg = '<img src="no_red.png" height="12" style="width:auto;background:none;display:inline;"/>',
    errorimg = '<img src="error_red.png" height="13" style="width:auto;background:none;display:inline;"/>',
    warnimg = '<img src="warning.png" height="13" style="width:auto;background:none;display:inline;"/>';

// Highlight function
//**********************************************
function highlight(url) {
    var highValue = document.getElementById('highlight').value.replace(/(\^)|(\\)|(\?)|(\.)|(\^)|(\$)|(\+)/g, function (all, first, second, third, fourth, fifth, sixth, seventh) {
        var array = [first, second, third, fourth, fifth, sixth, seventh], f;
        for (f = 0; f < 6; f += 1) {
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
    if (/\?.*?\?/ig.test(str)) {
        str = str.replace(/\?/ig, '<span class="warn">?</span>');
        str = str.replace('&#8618;', warnimg);
    }
    if (/(https?.*?)(#.*?)(\?|&)/ig.test(str)) {
        str = str.replace(/(https?.*?)(#.*?)(\?|&)/ig, '<span class="warn">$1</span>$2');
        str = str.replace('&#8618;', warnimg);
    }
    return str;
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

        resultString = '<span class="txt">' + filtLinks[i].text.replace(/display:block|display:none/ig, 'display:inline') + '</span>' +
            '<p class="break" style="padding-left:6.75em;"><span class="orig"><b>Original Link:</b> ' +
                highlight(filtLinks[i].url) + '</p></span>';

        if (/tel:|mailto:/ig.test(filtLinks[i].url)) {
            resultString += '<p style="margin:8px 0 0 0;padding-left:2em" class="no">' + noimg + ' No Further Redirect</p>';
        } else if (typeof filtLinks[i].header === "undefined") {
            resultString += '<br />Loading...';
        } else {
            var checkall = (document.getElementById('fullCheck').checked) ? filtLinks[i].header.data.length : 1;
            for (z = 0; z < checkall; z += 1) {

                if (typeof filtLinks[i].header.data[z].response.info === "undefined" || typeof filtLinks[i].header.data[z].response.info.redirect_url === "undefined") {
                    if (typeof filtLinks[i].header.data[z].response.info === "undefined" || /^404$/.test(filtLinks[i].header.data[z].response.info.http_code)) {
                        resultString += '<p style="margin:8px 0 0 0;padding-left:' + ((z + 2)) + 'em" class="no">' +
                            errorimg + ' HTTP/1.1 404 Not Found</p>';
                    } else {
                        resultString += '<p style="margin:8px 0 0 0;padding-left:' + ((z + 2)) + 'em" class="no">' +
                            noimg + ' No Further Redirect</p>';
                    }
                } else {
                    resultString += validate('<p class="break" style="padding-left:' + ((z + 1) + 6.75) + 'em"><span class="hea">&#8618; Redirects to:</span> ' + highlight(filtLinks[i].header.data[z].response.info.redirect_url));
                    resultString += ' &#160;<nobr>[<a target="_blank" href="' + filtLinks[i].header.data[z].response.info.redirect_url + '">visit link</a>]</nobr></p>';
                }
            }
        }
        col0.innerHTML = resultString;

        // Alternating background color
        row.className = (i % 2 === 0) ? 'rowa' : 'rowb';

        row.appendChild(col0);
        linksTable.appendChild(row);
    }
    document.getElementById('showing').innerHTML = 'Showing ' + filtLinks.length + ' of ' + selectedLinks.length + '.';
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

function showStuff() {
  document.getElementById('compareto').style.height = '175px';
  document.getElementById('compareto').style.width = '100%';
}

window.onload = function () {
    document.getElementById('filter').onkeyup = filterLinks;
    document.getElementById('highlight').onkeyup = showLinks;
    document.getElementById('fullCheck').onchange = showLinks;
    document.getElementById('openall').onclick = openLinks;
    document.getElementById('compareto').onclick = showStuff;
    document.getElementById('copy').innerHTML = '&copy;' + new Date().getFullYear() + ' Tim Mullen';
};
