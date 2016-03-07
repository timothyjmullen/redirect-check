// Copyright (c) 2015 Tim Mullen. All rights reserved.
// This gets the selected links from the eventPage, checks the redirects and calls out any validation errors.
/*jslint node: true */
'use strict';

var allImgs = [],
    allImgs = [],
    noimg = '<img src="no_red.png" height="12" style="width:auto;background:none;display:inline;"/>',
    errorimg = '<img src="error_red.png" height="13" style="width:auto;background:none;display:inline;"/>',
    warnimg = '<img src="warning.png" height="13" style="width:auto;background:none;display:inline;"/>';

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
        console.log(highValue.source);
        url = url.replace(/<span class="hlt">(.*?)<\/span>/ig, '$1');
        url = url.replace(highValue, '<span class="hlt">$1</span>');
    }
    return url;
}

// Image Name Validation function
//**********************************************
function validate(str) {
    if (/(\s|\+|\%20)/ig.test(str)) {
        str = str.replace(/(\s|\+|\%20)/ig, '<span class="warn" id="time">$1<span class="warn tooltip" content="Spaces in image names can cause loading problems in Gmail."></span></span>');
    }
    return str;
}

// Image Sie Validation
//**********************************************
function validateSize(num, formatted) {
    if (num > 1048576) {
        return '<span class="warn" id="time">' + formatted + '<span class="warn tooltip" content="This image is larger than recommended for email; it could load very slowly on mobile devices."></span></span>'
    }
    return formatted;
}

// Format bytes to KB, MB, or GB
//**********************************************
function formatBytes(bytes,decimals) {
   if(bytes == NaN) return 'unavailable';
   if(bytes == 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Build table for page
//**********************************************
function showImgs() {
    var imgTable = document.getElementById('links'), row, col0, resultString = '', i;

    // Clear Table
    while (imgTable.children.length > 0) {
        imgTable.removeChild(imgTable.children[imgTable.children.length - 1]);
    }

    for (i = 0; i < allImgs.length; i += 1) {
        // Create table elements
        row = document.createElement('tr');
        col0 = document.createElement('td');

        if (document.getElementById('myonoffswitch').checked) {
          resultString = '<span class="txt"><img src="' + allImgs[i].src + '"/></span><hr />\n' +
            '<p class="break"><b>Image:</b> ' +
            highlight(validate(allImgs[i].src.replace(/.*?([^\.\/]*\.[^\.]*)$/ig, '$1'))) + '</p>' +
            '<p class="break"><b>Alt Text:</b> ' +
            highlight(allImgs[i].alt) + '</p>\n' +
            '<p class="break"><b>Title Text:</b> ' +
            highlight(allImgs[i].title) + '</p>' +
            '<p class="break"><b>Image Size:</b> ' +
            validateSize(allImgs[i].size, formatBytes(allImgs[i].size, 1)).replace(/nan.*/i, "") + '</p>';
          col0.innerHTML = resultString;

          // Alternating background color
          //row.className = (i % 2 === 0) ? 'rowa' : 'rowb';

          row.appendChild(col0);
          imgTable.appendChild(row);

          // Show table
          document.getElementById('loading').className = 'hide';
          imgTable.className = 'show';

        } else if ((allImgs[i].size > 1024 && !/spacer/i.test(allImgs[i].src)) || (allImgs[i].alt || allImgs[i].title)) {
          resultString = '<span class="txt"><img src="' + allImgs[i].src + '"/></span><hr />\n' +
          '<p class="break"><b>Image:</b> ' +
          highlight(validate(allImgs[i].src.replace(/.*?([^\.\/]*\.[^\.]*)$/ig, '$1'))) + '</p>' +
              '<p class="break"><b>Alt Text:</b> ' +
                  highlight(allImgs[i].alt) + '</p>\n' +
                  '<p class="break"><b>Title Text:</b> ' +
                  highlight(allImgs[i].title) + '</p>' +
                  '<p class="break"><b>Image Size:</b> ' +
                  validateSize(allImgs[i].size, formatBytes(allImgs[i].size, 1)).replace(/nan.*/i, "") + '</p>';
                  col0.innerHTML = resultString;

                  // Alternating background color
                  //row.className = (i % 2 === 0) ? 'rowa' : 'rowb';

                  row.appendChild(col0);
                  imgTable.appendChild(row);

                  // Show table
                  document.getElementById('loading').className = 'hide';
                  imgTable.className = 'show';
        }
        document.getElementById('showing').innerHTML = 'Showing ' + imgTable.children.length + ' of ' + allImgs.length + '.';
    }
}

// Get selected links from eventPage
//**********************************************
function setImgs(imgs) {
    allImgs = imgs;
    showImgs();
    document.title = 'Alt & Title Results: ' + allImgs[0].ptitle;
}

// Check preference and check option accordingly
//**********************************************
function preferenceCheck() {
  chrome.storage.sync.get({
    allimages: false
  }, function(items) {
    document.getElementById('myonoffswitch').checked = items.allimages;
  });
}

window.onload = function () {
    preferenceCheck();
    document.getElementById('highlight').onkeyup = showImgs;
    document.getElementById('myonoffswitch').onchange = showImgs;
    document.getElementById('copy').innerHTML = '&copy;' + new Date().getFullYear() + ' Tim Mullen';
};
