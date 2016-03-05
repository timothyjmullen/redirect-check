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

        if (document.getElementById('fullCheck').checked) {
          resultString = '<span class="txt"><img src="' + allImgs[i].src + '"/></span>\n' +
              '<p class="break" style="padding-left:6.75em;"><span class="orig"><b>Image:</b> ' +
              highlight(validate(allImgs[i].src.replace(/.*?([^\.\/]*\.[^\.]*)$/ig, '$1'))) + '</p></span>' +
              '<p class="break" style="padding-left:6.75em;"><span class="orig"><b>Alt Text:</b> ' +
                  highlight(allImgs[i].alt) + '</p></span>\n' +
                  '<p class="break" style="padding-left:6.75em;"><span class="orig"><b>Title Text:</b> ' +
                  highlight(allImgs[i].title) + '</p></span>';
                  col0.innerHTML = resultString;

                  // Alternating background color
                  row.className = (i % 2 === 0) ? 'rowa' : 'rowb';

                  row.appendChild(col0);
                  imgTable.appendChild(row);
        } else if (allImgs[i].size > 50) {
          resultString = '<span class="txt"><img src="' + allImgs[i].src + '"/></span>\n' +
          '<p class="break" style="padding-left:6.75em;"><span class="orig"><b>Image:</b> ' +
          highlight(validate(allImgs[i].src.replace(/.*?([^\.\/]*\.[^\.]*)$/ig, '$1'))) + '</p></span>' +
              '<p class="break" style="padding-left:6.75em;"><span class="orig"><b>Alt Text:</b> ' +
                  highlight(allImgs[i].alt) + '</p></span>\n' +
                  '<p class="break" style="padding-left:6.75em;"><span class="orig"><b>Title Text:</b> ' +
                  highlight(allImgs[i].title) + '</p></span>';
                  col0.innerHTML = resultString;

                  // Alternating background color
                  row.className = (i % 2 === 0) ? 'rowa' : 'rowb';

                  row.appendChild(col0);
                  imgTable.appendChild(row);
        }
    }
}

// Get selected links from eventPage
//**********************************************
function setImgs(imgs) {
    allImgs = imgs;
    console.log(imgs);
    showImgs();
    document.title = 'Alt & Title Results: ' + allImgs[0].ptitle;
}

window.onload = function () {
    document.getElementById('highlight').onkeyup = showImgs;
    document.getElementById('fullCheck').onchange = showImgs;
    document.getElementById('copy').innerHTML = '&copy;' + new Date().getFullYear() + ' Tim Mullen';
};
