chrome.webRequest.onCompleted.addListener(
  function(details) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      if (tabs[0] === undefined || tabs[0].url.indexOf("timesheets") === -1) return;
      chrome.tabs.sendMessage(tabs[0].id, {action: "refreshTimesheet"});  
    });
  },
  {urls: ['*://*.mavenlink.com/timesheets/time_entries*'
         ,'*://*.kantata.com/timesheets/time_entries*'
         ,'*://*.mavenlink.com/timesheets/weekly*'
         ,'*://*.kantata.com/timesheets/weekly*']},
  []
);