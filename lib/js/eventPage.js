// This is a non-persistent event page to pass the selected links to the new tab.
/*jslint node: true */
'use strict';

var viewTabUrl = chrome.extension.getURL('results.html?id='),
    viewTabUrlImgs = chrome.extension.getURL('results_img.html?id='),
    selectedLinks = [],
    allImgs = [];

// Generate Random-ish ID
function makeID() {
    var text = "",
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        i;
    for (i = 0; i < 5; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function runAPI() {
  // Generate a unique page identifier
  viewTabUrl = viewTabUrl.replace(/id=.*$/, 'id=') +  makeID();

  // Create new tab and send links along to the results page
  chrome.tabs.create({
      url: viewTabUrl
  }, function (tab) {

      var targetId = tab.id;
      var sendLinks = function (tabId, changedProps) {
          // Wait for the new tab to finish loading.
          if (tabId !== targetId || changedProps.status !== "complete") { return; }
          chrome.tabs.onUpdated.removeListener(sendLinks);

          // Find the right window for the results tab.
          var views = chrome.extension.getViews();
          for (var i = 0; i < views.length; i++) {

              var view = views[i];
              if (view.location.href == viewTabUrl) {

                  function makeRequest(ind, callback) {
                      var xhr = new XMLHttpRequest();
                      var index = ind;
                      xhr.open("GET", "http://rc-rc.1d35.starter-us-east-1.openshiftapps.com/redirect-check.php?url=" + encodeURIComponent(selectedLinks[ind].url), true);
                      xhr.onreadystatechange = function () {
                          if (xhr.readyState == 4) {
                              //console.log(xhr);
                              callback.call(xhr.responseText, index);
                          }
                      }
                      xhr.send();
                  }

                  for (var x = 0; x < selectedLinks.length; x += 1) {
                      makeRequest(x, function (index) {
                          selectedLinks[index]["header"] = JSON.parse(this);
                          //selectedLinks[index]["header"] = this;
                          //console.log(selectedLinks[index]["header"]);
                          view.showLinks();
                      });
                  }

                  view.setLinks(selectedLinks);
                  break;
              }
          }

      };

      chrome.tabs.onUpdated.addListener(sendLinks);
  });
}

// Context Menu
//******************************************
function singleLookup(x) {
  //console.log('this ran: ' + JSON.stringify(x));
  selectedLinks = [{title: x.linkUrl, url: x.linkUrl, text: x.linkUrl}];
  runAPI();
}
chrome.contextMenus.onClicked.addListener(singleLookup);
chrome.contextMenus.create({"title": "Redirect Check","contexts": ["link"],"id": "contextlink"});

// Message Listeners
//******************************************
chrome.runtime.onMessage.addListener(
    function (request, sender) {
        console.log('this other thing ran');
        if (request.from === "popup" || request.from === "ctxmenu") {
            selectedLinks = request.selectedLinks;
            runAPI();
        } else if (request.from === "openthis") {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the popup");
            var allLinks = request.allLinks, s, linksArray = [];
            for (s = 0; s < allLinks.length; s += 1) {
                if (!/mailto:|tel:/ig.test(allLinks[s].url)) {
                    linksArray.push(allLinks[s].url);
                }
            }
            chrome.windows.create({url: linksArray});
        } else if (request.from == "popup_img") {
            allImgs = request.allImgs;
            // Generate a unique page identifier
            viewTabUrlImgs = viewTabUrlImgs.replace(/id=.*$/, 'id=') +  makeID();
            // Create new tab and send images along to the results page
            chrome.tabs.create({
                url: viewTabUrlImgs
            }, function (tab) {
              var targetId = tab.id;
              var sendImgs = function (tabId, changedProps) {
                  // Wait for the new tab to finish loading.
                  if (tabId !== targetId || changedProps.status !== "complete") { return; }
                  chrome.tabs.onUpdated.removeListener(sendImgs);

              // Find the right window for the results tab.
              var views = chrome.extension.getViews();
              for (var i = 0; i < views.length; i++) {
                  var view = views[i];
                  if (view.location.href == viewTabUrlImgs) {

                    function makeRequest(ind, callback) {
                        var xhr = new XMLHttpRequest();
                        var index = ind;
                        xhr.open("HEAD", allImgs[ind].src, true);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4) {
                                //console.log(xhr.getResponseHeader('Content-Length'));
                                callback.call(xhr.getResponseHeader('Content-Length'), index);
                            }
                        }
                        xhr.send();
                    }

                    for (var x = 0; x < allImgs.length; x += 1) {
                        makeRequest(x, function (index) {
                            allImgs[index]["size"] = this;
                            //console.log(allImgs[index].size);
                            view.setImgs(allImgs);
                        });
                    }
                    view.setImgs(request.allImgs);
                  }
                }
              }
              chrome.tabs.onUpdated.addListener(sendImgs);
        });
    }
});
