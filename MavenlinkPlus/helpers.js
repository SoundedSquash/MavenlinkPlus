//Convert hour minutes format to integer to do math on
function ConvertHourMinutesToInt(input) {
    //Verify input is in the format "#h #m"
    //  If not, return 0
    if (input.indexOf("h") == -1 || input.indexOf("m") == -1) {
      return 0;
    }
  
    //Remove text, split by space, and convert to minutes.
    var array = input.replace("h","").replace("m","").split(" ");
    return (parseInt(array[0], 10) * 60) + (parseInt(array[1], 10));
}
  
//Convert integer to hour minutes format to display on page
function ConvertIntToHourMinutes(input) {
    var negative = input < 0;
    input = Math.abs(input);
    var hours = Math.floor(input / 60);
    var minutes = input % 60;
    return `${negative ? "-" : ""}${hours}h ${minutes}m`;
}

function ConvertHeaderToDate(headerString) {
    // Split the input string into 'from' and 'to' parts
    const [from, to] = headerString.split(' - ');

    // Extract the month, day from the 'from' part and year from the 'to' part
    const [fromMonth, fromDay] = from.split(' ');
    const toYear = to.split(', ')[1];

    // Define a month mapping
    const monthMapping = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    // Handle year wrapping
    let year = toYear;
    if (fromMonth === 'Dec' && to.split(' ')[0] === 'Jan') {
        year = (parseInt(toYear) - 1).toString();
    }

    // Construct the date string
    const dateString = `${year}-${monthMapping[fromMonth]}-${fromDay.padStart(2, '0')}`;

    return dateString;

}

//Function used to wait for an element to load. Mavenlink loads the table after document is ready.
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
  
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
  
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}