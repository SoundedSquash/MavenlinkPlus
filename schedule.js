function RefreshScheduleTotals() {
  waitForElm('#schedule-view').then((elm) => {
    var billTotal = 0;
    var nonBillTotal = 0;
    //For each day td wiith class "day1" through "day7"
    for (var i = 1; i <= 7; i++) {
      var day = document.getElementsByClassName("summary-cell day" + i)[0];
      //  Get the value of the div element with class "billable"
      var billable = day.getElementsByClassName("billable")[0];
      var billMinutes = ConvertHourMinutesToInt(billable.innerHTML);
      //  Add the value to the total
      billTotal += billMinutes;
      //Repeat for unbillable
      var nonBillable = day.getElementsByClassName("non-billable")[0];
      var nonBillMinutes = ConvertHourMinutesToInt(nonBillable.innerHTML);
      nonBillTotal += nonBillMinutes;

      //Set the total for the day
      var dayTotal = day.getElementsByClassName("day-total")[0];
      if (!dayTotal) {
        var div = document.createElement("div");
        div.classList.add("day-total");
        div.innerHTML = ConvertIntToHourMinutes(billMinutes + nonBillMinutes);
        day.appendChild(div);
      } else {
        dayTotal.innerHTML = ConvertIntToHourMinutes(billMinutes + nonBillMinutes);
      }
    }

    RefreshScheduleProjectTotals();
  });
}

function RefreshScheduleProjectTotals() {

  //HTMLCollection type
  var projects = $('.item');
  var dict = {};

  for (let i = 0; i < projects.length; i++) {
    var taskTimes = {
      Billable: 0,
      NonBillable: 0
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

  if (dict.length == 0) return;
  //Write to table
  var table = $('<table style="width:750px;" />');
  table.append('<thead><tr><th style="width:55%;">Project</th><th style="width:15%; color:green;">Billable</th><th style="width:15%;">Non-Billable</th><th style="width:15%;">Total</th></thead>');

  //Create row for each project that has time totals.
  var tbody = '<tbody>';
  Object.entries(dict).forEach(([key, value]) => {
    if (value.Billable + value.NonBillable == 0) return;

    tbody += '<tr><td>' + key + '</td><td style="color:green;">' + ConvertIntToHourMinutes(value.Billable) + '</td><td>' + ConvertIntToHourMinutes(value.NonBillable) + '</td><td>' + ConvertIntToHourMinutes(value.Billable + value.NonBillable) + '</td></tr>';
  });
  tbody += '</tbody>';

  table.append(tbody);

  //Create div if it doesn't exist and put table inside.
  if ($('#ProjectTotals').length === 0) {
    $('.table-controls').prepend('<div id="ProjectTotals" />');
  }
    $('#ProjectTotals').html(table);
  
}

//Listen for message from background to refresh the timesheet totals.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "refreshSchedule") {
      RefreshScheduleTotals();
    }
    return true;
  });

//Refresh the totals when the page is fully loaded
window.onload = RefreshScheduleTotals();