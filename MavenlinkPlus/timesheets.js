function RefreshTimesheetTotals() {
  waitForElm('.weekly-table').then((elm) => {
    var billTotal = 0;
    var nonBillTotal = 0;
    //For each day td with class "day1" through "day7"
    for (var i = 1; i <= 7; i++) {
      var day = document.getElementsByClassName("summary-cell day" + i)[0];
      //  Get the value of the div element with class "billable"
      var billable = day.getElementsByClassName("billable")[0];
      var billMinutes = ConvertHourMinutesToInt(billable.innerText);
      //  Add the value to the total
      billTotal += billMinutes;
      //Repeat for unbillable
      var nonBillable = day.getElementsByClassName("non-billable")[0];
      var nonBillMinutes = ConvertHourMinutesToInt(nonBillable.innerText);
      nonBillTotal += nonBillMinutes;

      //Set the total for the day
      var dayTotal = day.getElementsByClassName("day-total")[0];
      if (!dayTotal) {
        var div = document.createElement("div");
        div.classList.add("day-total");
        div.innerText = ConvertIntToHourMinutes(billMinutes + nonBillMinutes);
        day.appendChild(div);
      } else {
        dayTotal.innerText = ConvertIntToHourMinutes(billMinutes + nonBillMinutes);
      }
    }

    RefreshTimesheetProjectTotals();
  });
}

function RefreshTimesheetProjectTotals() {

  //HTMLCollection type
  var projects = $('.item');
  var dict = {};

  for (let i = 0; i < projects.length; i++) {
    var taskTimes = {
      Billable: 0,
      NonBillable: 0,
      Actual: 0,
      Scheduled: 0
    }
    var project = projects[i];

    //Find each day's time per row and sum values.
    //This will help us tally time per project.
    var summary = $(project).eq(0).parents("tr").eq(0).find('.edit-region');
    if (summary.length > 0) {
      //There can be two types of entries.
      //One is basic where it will keep time in an input's value attribute.
      //The other is when multiple entries are added and it uses a div for each entry.
      //We also have to be aware of billable vs non billable.

      summary.children('input.billable').each(function () {
        taskTimes.Billable += ConvertHourMinutesToInt($(this).attr('value'));
      });

      summary.children('input.non-billable').each(function () {
        taskTimes.NonBillable += ConvertHourMinutesToInt($(this).attr('value'));
      });

      //Logic for multi-div entries (value is in innerText)
      summary.find('div.billable').each(function () {
        taskTimes.Billable += ConvertHourMinutesToInt($(this).text());
      });

      summary.find('div.non-billable').each(function () {
        taskTimes.NonBillable += ConvertHourMinutesToInt($(this).text());
      });
    }

    if(dict.hasOwnProperty(project.innerText)) {
      var tempTimes = dict[project.innerText];
      taskTimes.Billable += tempTimes.Billable;
      taskTimes.NonBillable += tempTimes.NonBillable;
    }
    //Update project totals dictionary.
    dict[project.innerText] = taskTimes;
  };

  //Add scheduled time to project totals
  RetrieveProjectScheduledTotals(function(response) {
    var scheduledProjects = response;

    scheduledProjects.forEach(function(scheduledProject) {
      var project = scheduledProject.workspaceId;
      var actualTime = scheduledProject.data.actual;
      var scheduledTime = scheduledProject.data.scheduled;
      if (dict.hasOwnProperty(project)) {
        var tempTimes = dict[project];
        tempTimes.Actual += actualTime;
        tempTimes.Scheduled += scheduledTime;
        dict[project] = tempTimes;
      } else {
        dict[project] = { Billable: 0, NonBillable: 0, Actual: actualTime, Scheduled: scheduledTime };
      }
    });

    if (dict.length == 0) return;
    //Write to table
    var table = $('<table style="width:800px;" />');
    table.append('<thead><tr><th style="width:55%;">Project</th><th style="width:11.25%; color:green;">Billable</th><th style="width:11.25%;">Non-Billable</th><th style="width:11.25%;">Total</th><th style="width:11.25%;">Scheduled Remaining</th></thead>');

    //Create row for each project that has time totals.
    var tbody = '<tbody>';
    var keys = Object.keys(dict);
    keys.sort();
    keys.forEach((key) => {
      var value = dict[key];
      if (value.Billable + value.NonBillable + value.Actual + value.Scheduled == 0) return;

      tbody += '<tr><td>' + key + '</td><td style="color:green;">' + ConvertIntToHourMinutes(value.Billable) + '</td><td>' + ConvertIntToHourMinutes(value.NonBillable) + '</td><td>' + ConvertIntToHourMinutes(value.Billable + value.NonBillable) + '</td><td>' + ConvertIntToHourMinutes(Math.max(0, value.Scheduled - (value.Billable + value.NonBillable))) + '</td></tr>';
    });
    tbody += '</tbody>';

    table.append(tbody);

    //Create div if it doesn't exist and put table inside.
    if ($('#ProjectTotals').length === 0) {
      $('.table-controls').prepend('<div id="ProjectTotals" />');
    }
      $('#ProjectTotals').html(table);
    
  });
  
}

// Returns an array of objects with the following structure:
// [
//   {
//     workspaceId: "Project Name",
//     data: {
//       actual: 123,
//       scheduled: 123
//     }
//   },
//   ...
// ]
function RetrieveProjectScheduledTotals(callback) {
  var scheduledProjects = {};

  var xhr = new XMLHttpRequest();
  var dateString = ConvertHeaderToDate(document.getElementsByClassName("date")[0].innerText);
  xhr.open("GET", '/schedule.json?date=' + dateString, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);

      // Initialize an empty object to store the results
      var result = {};

      // Iterate over each item in resp.data
      resp.data.forEach(function(story) {
        // Get the workspace title to match with timesheet project name later on.
        var workspaceId = story.workspace.title;

        // If this workspace ID hasn't been seen before, initialize it in the result object
        if (!result[workspaceId]) {
          result[workspaceId] = { actual: 0, scheduled: 0 };
        }

        // Get the keys of the story.days object
        var daysKeys = Object.keys(story.days)
        
        // Iterate over each key in story.days
        daysKeys.forEach(function(key) {
          // Get the day object associated with the key
          var day = story.days[key];
          
          // Add the actual and scheduled values to the result
          result[workspaceId].actual += day.actual;
          result[workspaceId].scheduled += day.scheduled;
        });
      });

      // Convert the result object to an array of objects
      scheduledProjects = Object.keys(result).map(function(workspaceId) {
        return { workspaceId: workspaceId, data: result[workspaceId] };
      });

      callback(scheduledProjects);
    }
  }
  xhr.send();
}

//Listen for message from background to refresh the timesheet totals.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "refreshTimesheet") {
      RefreshTimesheetTotals();
    }
    return Promise.resolve({ success: true });
  });


//Refresh the totals when the page is fully loaded
window.onload = RefreshTimesheetTotals();