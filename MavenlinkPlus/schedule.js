async function fetchDataAndProcess() {
    var storiesIds = $('.calendar table div.workspace_and_title > div.title > a')
        .map(function() { 
                return $(this).data('story-id'); 
            }
        ).get(); // Get array object
        var storiesIdsString = storiesIds.join(','); // Join them by comma into string
    try {
        const response = await fetch("/api/v1/stories.json?only=" + storiesIdsString);
        if (!response.ok) {
            throw new Error('Could not fetch story data');
        }
        const data = await response.json();
        showTotals(storiesIds, data);
    } catch (error) {
        console.error('Failed to fetch data: ', error);
    }
}

function showTotals(storiesIds, data) {
    console.log(data);

    // Create header column
    $("thead.header td.scheduled_actual").before("<td class='scheduled_actual'>Estimated / <span class='actual'>Actual</span></td>");
    // Nothing in overview row
    $("tr.overview td.scheduled_actual").before("<td></td>");
    // Loop through storiesIds since they are in order and match to the data from the response
    var rows = $("tr.row td.scheduled_actual");
    for (let i = 0; i < storiesIds.length; i++) {
        const storyId = storiesIds[i];
        const story = data.stories[storyId];
        $(rows[i]).before(`<td class='scheduled_actual'>
            ${ConvertIntToHourMinutes(story.time_estimate_in_minutes)} / <span class='actual'>${ConvertIntToHourMinutes(story.logged_billable_time_in_minutes)}</span>
            <br/>
            ${ConvertIntToHourMinutes(story.time_estimate_in_minutes - story.logged_billable_time_in_minutes)}</td>`);
    }
}

//Listen for message from background to refresh the timesheet totals.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "refreshSchedule") {
        fetchDataAndProcess();
      }
      return Promise.resolve({ success: true });
    }
);