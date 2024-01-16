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
    var hours = Math.floor(input / 60);
    var minutes = input % 60;
    return hours + "h " + minutes + "m";
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