// Copyright (c) 2015 Tim Mullen. All rights reserved.
// Send back to the popup a list of URLs and the linked text in a multi-dimensional array.
// The popup injects this script into the first frame in the active tab.

var linksArray = [],
    fullLinks = [],
    title = document.getElementsByTagName("title")[0].innerHTML || '',
    aXML = [].slice.apply(document.getElementsByTagName('a'));

// Grab URL
linksArray[0] = aXML.map(function (element) {
  var href = element.href;
  return href;
});

// Grab linked html
linksArray[1] = aXML.map(function (element) {
  var linkText = element.innerHTML;
  return linkText;
});

// Build fullLinks object
for (var i = 0; i < linksArray[0].length; i++) {
    if (linksArray[0][i].length > 0) {
        fullLinks.push({
            title: title,
            url: linksArray[0][i],
            text: linksArray[1][i]
        });
    }
}
chrome.runtime.sendMessage(fullLinks);
