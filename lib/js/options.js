// Saves options to chrome.storage.sync.
function save_options() {
  var allImages = document.getElementById('allimages').checked;
  var fullChain = document.getElementById('fullchain').checked;
  chrome.storage.sync.set({
    allimages: allImages,
    fullchain: fullChain
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    allimages: false,
    fullchain: true
  }, function(items) {
    document.getElementById('allimages').checked = items.allimages;
    document.getElementById('fullchain').checked = items.fullchain;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
