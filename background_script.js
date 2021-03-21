// Put all the javascript code here, that you want to execute in background.
browser.browserAction.onClicked.addListener((tab) => {

  browser.windows.create({
    url: 'browserAction/index.html',
    type: "popup",
    height: 600,
    width: 400
  })
    .then((w) => {
      // send tab details
      // see comments in script.js for motivation
      function handleMessage(request, sender, sendResponse) {
        sendResponse({tab: tab});
        // only need this once, so trash it after.
        browser.runtime.onMessage.removeListener(handleMessage);
      };
      browser.runtime.onMessage.addListener(handleMessage);
    })
});


