var urlInput = () => {
  return document.getElementById('url');
};
var commentInput = () => {
  return document.getElementById('comment');
};
var scrapePdfInput = () => {
  return document.getElementById('scrape-pdf');
};

// this is pretty janky, but basically:
// - we want to be able to open a file navigator without closing our popup,
//   which means (for firefox) we can't rely on default_popup, and need to open
//   it ourselves from background_script.js.
// - non default_popup popups don't have access to tab details.
// - so we ask background_script.js to tell us the tab, so we can access its details.
// this was helpful: https://stackoverflow.com/a/19758800
var title;
var tab;
browser.runtime.sendMessage({}).then((response) => {
  tab = response.tab;
  title = tab.title;
  urlInput().value = tab.url;
});

var state = {
  saving: false,
  saved: false,
};

var constructFileContent = () => {
  var time = new Date().toISOString();
  var url = urlInput().value;
  var headers = [];
  headers.push(`url: [${url}](${url})`);
  headers.push(`processed: ${time}`);
  if (scrapePdfInput().checked) {
    headers.push('pdf: TK');
  }

  head = headers.join('\n\n');

  var comment = commentInput().value;
  if (comment) {
    return `${head}

-------

${comment}
`;
  }
  return head;
};
console.log(document);

document.getElementById('save-button').addEventListener('click', (e) => {
  console.log('saving!');
  // no double saves
  if (state.saving || state.saved) {
    return;
  }
  state.saving = true;

  // construct file content
  var content = constructFileContent();

  var f = new File([content], '');  // what should i actually use this second param for?
  var objURL = URL.createObjectURL(f);
  browser.downloads.download({
    filename: `${title.toLowerCase().replaceAll(' ', '-').replace(/[\W_]+/g,"-")}.md`,
    url: objURL,
    saveAs: true
  }).then((r) => {
    // note success
    state.saved = true;
    document.getElementById('save-place').innerHTML = '<p>saved!</p>';

    ;
  }, (e) => {
    console.log(e);
    state.saved = false;
    document.getElementById('save-place').innerHTML = '<p>uh oh! check console.</p>';
  });
});

