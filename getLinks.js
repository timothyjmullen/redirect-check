// Send back to the popup a list of URLs and the linked text in a multi-dimensional array.
// The popup injects this script into the first frame in the active tab.

var linksArray = [],
    fullLinks = [],
    title = document.getElementsByTagName("title") || '',
    aXML,
    tabURL = window.location.href || '',
    imgArray = [],
    imgXML,
    fullImg = [];

// Title Bug Fix
if (title[0]) {
  title = title[0].innerHTML;
}

function grabURLS (cb) {
  // Only grab email links in Gmail
  if (/mail\.google\.com/i.test(tabURL) && !/&view=lg/.test(tabURL)) {
    aXML = [].slice.apply(document.querySelectorAll('.a3s a'));
  } else {
    aXML = [].slice.apply(document.getElementsByTagName('a'));
  }
  if (!aXML) {aXML = [].slice.apply(document.getElementsByTagName('a'));}
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
              title: (JSON.stringify(title) == '{}') ? tabURL : title,
              url: linksArray[0][i],
              text: linksArray[1][i]
          });
      }
  }
  cb(fullLinks);
}

function grabIMGS (cb) {
  // Only grab email links in Gmail
  if (/mail\.google\.com/i.test(tabURL) && !/&view=lg/.test(tabURL)) {
    imgXML = [].slice.apply(document.querySelectorAll('.a3s img'));
  } else {
    imgXML = [].slice.apply(document.getElementsByTagName('img'));
  }
  if (!imgXML) {imgXML = [].slice.apply(document.getElementsByTagName('img'));}
  // Grab alt
  imgArray[0] = imgXML.map(function (element) {
    var alt = element.alt;
    if (alt) {return alt;} else {return ''}
  });

  // Grab title
  imgArray[1] = imgXML.map(function (element) {
    var ititle = element.title;
    if (ititle) {return ititle;} else {return ''}
  });

  // Grab src
  imgArray[2] = imgXML.map(function (element) {
    var src = element.src;
    if (src) {return src;} else {return ''}
  });

  // Build fullImg object
  for (var j = 0; j < imgArray[2].length; j++) {
      if (imgArray[2][j].length > 0) {
          fullImg.push({
              ptitle: title,
              src: imgArray[2][j],
              alt: imgArray[0][j],
              title: imgArray[1][j]
          });
      }
  }
  cb(fullImg);
}

grabIMGS(function (fi) {
  chrome.runtime.sendMessage({from: "imgs", fullImg: fi});
})
grabURLS(function (fl) {
  chrome.runtime.sendMessage({from: "links", fullLinks: fl});
})
