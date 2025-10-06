function SendMessage(urlContains, message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    if (tabs[0] === undefined || tabs[0].url.indexOf(urlContains) === -1) return;
      chrome.tabs.sendMessage(tabs[0].id, {action: message});  
  });
}

chrome.webRequest.onCompleted.addListener(
  function(_details) {
    SendMessage('timesheets', 'refreshTimesheet');
  },
  {urls: ['*://*.mavenlink.com/timesheets/time_entries*'
         ,'*://*.kantata.com/timesheets/time_entries*'
         ,'*://*.mavenlink.com/api/v1/time_entries*'
         ,'*://*.kantata.com/api/v1/time_entries*'
         ,'*://*.mavenlink.com/timesheets/weekly*'
         ,'*://*.kantata.com/timesheets/weekly*']},
  []
);

chrome.webRequest.onCompleted.addListener(
  function(_details) {
    SendMessage('time_entries', 'refreshSchedule');
  },
  {urls: ['*://*.mavenlink.com/schedule.json*'
         ,'*://*.kantata.com/schedule.json*']},
  []
);