var page = document.querySelector("body"); // Fiddling with the html body element.
var lengthOfFile = 0; // Length of file, shrimple really.
var places = []; // Array to hold the places of the coins in the json file.
var dataCollect = []; // Array to hold the data of the coins in the json file.
var AgPrice = 0; // Variable to hold the current price of silver in CAD.
var lastUpdatedAt = null; // Time of the most recent successful price request.

AgPriceCheck();

// btw this whole thing worked fine when I was like, using the servers we get from the college
// idk if it does or doesnt work on github yet, didn't test yet 
// oh well!

async function AgPriceCheck() {

    const url = 'https://metal-sentinel.p.rapidapi.com/silver-price?currency=CAD';
	  const options = {
		method: 'GET',
		headers: {
			'x-rapidapi-key': `308300f395msh04005abe1a14d9ap125e2ajsn760536161c1f`, 
      //i'm pretty sure I'm supposed to put my API key... somewhere... 
            //I used to have my api key just right there lol
            //not the safest tool in the shed im afraid
            
			'x-rapidapi-host': 'metal-sentinel.p.rapidapi.com',
		    'Content-Type': 'application/json'
        }
    };// end of options object
    try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unable to fetch the silver price.');
    }

        console.log(result);
        
        AgPrice = result.results[0].bid; // Use optional chaining to safely access nested properties
        lastUpdatedAt = new Date();
        updateLastUpdated();

        updatedPrices();
        console.log("AgPrice is now:", AgPrice);
        
    
    } catch (error) {
	console.error(error);
    }
} // end of AgPriceCheck() function

function updateLastUpdated() {
  if (!lastUpdatedAt) return;

  const torontoTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(lastUpdatedAt);

  const parts = Object.fromEntries(
    torontoTime.map(({ type, value }) => [type, value])
  );
  const secondsAgo = Math.floor((Date.now() - lastUpdatedAt.getTime()) / 1000);

  document.querySelector('#lastUpdated').textContent =
    `Last Updated: ${parts.year} ${parts.month} ${parts.day}, ${parts.hour}:${parts.minute} Toronto Time (${secondsAgo} seconds ago)`;
}

setInterval(updateLastUpdated, 1000);

function updatedPrices() {
  document.querySelectorAll('.coin').forEach((coinCard, index) => {
    const coin = dataCollect[index];
    if (!coin) return;

    const asw = coin.ASW_toz * coin.weight_toz;
    const aswPrice = asw * AgPrice;

    const valueEl = coinCard.querySelector('.current_value');
    if (valueEl) {
      valueEl.textContent = `$${aswPrice.toFixed(2)}`;
    }
  });
}

fetch("assets/silver_coins.json")
  // When the file loads successfully, turn the response into JavaScript objects.
  .then(data => data.json())
  // Once the JSON is ready, do something with it.
  .then(data => {
    var num = 0;
    data.forEach(coin => {
        var ASW = coin.ASW_toz * coin.weight_toz; // Calculate the actual silver weight in a coin.
        var ASWprice = ASW * AgPrice; // Calculate the price of the actual silver weight in CAD.
        page.innerHTML += 
       `<div id="${num}" class="coin">
            <div class="coin_info">
                <p class="label">${coin.name}</p>
                <p class="sublabel"><b>Silver Purity:</b> ${coin.Ag * 100}%</p>
                <p class="sublabel"><b>Weight (grams):</b> ${coin.weight_g}</p>
                <p class="sublabel"><b>Actual Silver Weight (ASW) (troy ounces):</b> ${coin.ASW_toz}</p>
                <p class="sublabel"><b>Production Run:</b> ${coin.production_run}</p>
                <p class="sublabel"><b>Current Value:</b> <span class="current_value">${ASWprice.toFixed(2)}</span></p>
            </div>
            <div class="desc_div">
                <p>${coin.description}</p>
            </div>
        </div>`; // end of coin div

        num++;
        lengthOfFile++;
        places.push(num*100/data.length); 
        dataCollect.push(coin); 
        // dataCollect is an array of all the coin objects in the json file. 
        // This is used to access the data later on in the code.
        console.log(coin.name + " was added to the page."); 
    });
  })


  // If something goes wrong, log the error so we can see what failed.
  .catch(error => {
    console.error("Error fetching JSON file:", error);
  }); // end of fetch("silver_coins.json") function


