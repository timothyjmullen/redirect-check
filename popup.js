// Copyright (c) 2015 Tim Mullen. All rights reserved.
// This gets all of the links from the page and lets the user select which ones to check.
/*jslint node: true */
'use strict';

var allLinks = [],
    filtLinks = [],
    selectedLinks = [];

// Display all visible links.
//********************************************************************************
function showLinks() {
    var linksTable = document.getElementById('links'), i, row, col0, col1, checkbox;

    while (linksTable.children.length > 1) {
        linksTable.removeChild(linksTable.children[linksTable.children.length - 1]);
    }

    for (i = 0; i < filtLinks.length; i += 1) {
        row = document.createElement('tr');
        col0 = document.createElement('td');
        col1 = document.createElement('td');
        checkbox = document.createElement('input');

        // Try to catch unsubscribe links and uncheck them.
        if (/unsub|opt out|opt-out|optout|m\/u\/mbl\/m\.asp|m\/u\/cent\/cons\/c\.asp|m\/u\/scl\/u\.asp|m\/u\/gar\/g\.asp|m\/p\/csu\/cli\/unsub\.asp/ig.test(filtLinks[i].text) || /unsub|opt out|opt-out|optout|m\/u\/mbl\/m\.asp|m\/u\/cent\/cons\/c\.asp|m\/u\/scl\/u\.asp|m\/u\/gar\/g\.asp|m\/p\/csu\/cli\/unsub\.asp/ig.test(filtLinks[i].url)) {
            checkbox.checked = false;
            col0.className = 'unsub';
            col1.className = 'unsub';
        } else {
            checkbox.checked = true;
        }

        checkbox.type = 'checkbox';
        checkbox.id = 'check' + i;
        col0.appendChild(checkbox);

        col1.innerHTML = '<label style="display:block;width:100%" for="check' + i + '"><span class="txt" >' + filtLinks[i].text + '</span><br /><span style="display:block;clear:both;font-size:11px!important;color:#000!important;font-style:italic;font-weight:normal!important;" class="break">' + filtLinks[i].url + '</span></label>';

        // Alternating background color
        row.className = (i % 2 === 0) ? 'rowa' : 'rowb';

        row.appendChild(col0);
        row.appendChild(col1);
        linksTable.appendChild(row);
    }
}

// Toggle the checked state of all visible links.
//********************************************************************************
function toggleAll() {
    var checked = document.getElementById('toggle_all').checked, j;
    for (j = 0; j < filtLinks.length; j += 1) {
        document.getElementById('check' + j).checked = checked;
    }
}

// Send list of selected links to eventPage
//********************************************************************************
function checkLinks() {
    var i;
    for (i = 0; i < filtLinks.length; i += 1) {
        if (document.getElementById('check' + i).checked) {
            selectedLinks.push({
                title: filtLinks[i].title,
                url: filtLinks[i].url,
                text: filtLinks[i].text
            });
        }
    }
    chrome.runtime.sendMessage({from: "popup", selectedLinks: selectedLinks});
}

// Re-filter allLinks into filtLinks and reshow filtLinks.
//********************************************************************************
function filterLinks() {
    var filterValue = new RegExp(document.getElementById('filter').value, 'ig');
    filtLinks = allLinks.filter(function (fil) {
        if (filterValue.test(fil.text)) {
            return true;
        } else {
            return false;
        }
    });
    showLinks();
}

// Add links to allLinks and filtLinks and show them.
//********************************************************************************
chrome.runtime.onMessage.addListener(
    function (request, sender) {
        /*console.log(sender.tab ?
              "From a content script from this page: " + sender.tab.url :
              "From the extension");*/
        allLinks = request;
        filtLinks = allLinks;
        showLinks();
    }
);

// Send links to eventPage to open in new tabs
//**********************************************
function openLinks() {
    var allLinks = [], f;
    for (f = 0; f < filtLinks.length; f += 1) {
        if (document.getElementById('check' + f).checked) {
            allLinks.push({url: filtLinks[f].url});
        }
    }
    allLinks = {from: "openthis", allLinks: allLinks};
    chrome.runtime.sendMessage(allLinks);
}

// Set up event handlers and inject getLinks.js into all frames in the active tab.
//********************************************************************************
window.onload = function () {
    //document.getElementById('filter').onkeyup = filterLinks;
    document.getElementById('toggle_all').onchange = toggleAll;
    document.getElementById('download0').onclick = checkLinks;
    document.getElementById('download1').onclick = checkLinks;
    document.getElementById('openall').onclick = openLinks;
    document.getElementById('openall2').onclick = openLinks;

    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({active: true, windowId: currentWindow.id}, function (activeTabs) {
            chrome.tabs.executeScript(activeTabs[0].id, {file: 'getLinks.js', allFrames: false});
        });
    });
};
