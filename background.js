chrome.webRequest.onCompleted.addListener(
  function(details) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {action: "refreshTimesheet"}, function(response) {});  
    });
  },
  {urls: ['*://*.mavenlink.com/timesheets'
         ,'*://*.mavenlink.com/timesheets#'
         ,'*://*.mavenlink.com/timesheets/weekly*'
         ,'*://*.kantata.com/timesheets/weekly*']},
  []
);
// chrome.webRequest.onCompleted.addListener(
//   function(details) {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//       chrome.tabs.sendMessage(tabs[0].id, {action: "refreshSchedule"}, function(response) {});  
//     });
//   },
//   {urls: ['*://*.mavenlink.com/timesheets/time_entries/?tab=schedule*'
//          ,'*://*.kantata.com/timesheets/weekly*']},
//   []
// );