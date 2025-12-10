//Story
const storyTextContent = `
Tony is a solo traveller, fond of journeys and surprises. On a trip he was visiting
his best friend Stark. He brought a luggage full of gifts for Stark and was all set
to fly.
His journey started from an airport with a planned transit at a random European
airport. When he reaches the arrival hall, he realizes that his luggage is missing.
The airline system has mixed up baggage across several flights around Europe.
They offer him money as compensation for the lost luggage. Refusing to accept the
loss, they turn it into a mission to find the luggage. So, the airline authority
decides to hire a person — the player — to find his lost luggage.
The player starts with limited resources: money and fuel range. Each airport holds
a chance to find gifts or even the lost luggage, hidden inside mysterious boxes.
Sometimes opening a mystery box costs money or fuel, but the reward could be
massive.
There are also pickpockets in some airports. If the player meets them, they will
lose all their money.
The game becomes a strategic adventure: calculating flight distances, managing
fuel, buying more fuel if necessary, and carefully choosing the next airport in
range. Every decision can bring the player closer to Tony’s luggage or lead to an
unfortunate crash.
Finally, if the player discovers the lost luggage and returns to the starting
airport, the mission is accomplished: Tony’s gifts are saved, and the adventure is
won! Otherwise, if the player runs out of fuel or fails to locate the luggage,
the journey ends in failure.`;

//Player
let player = { name:"", money:499, fuel:499, currentAirport:"", luggageFound:false };

//Airports
let airports = [
  { ident: "HEL", name: "Helsinki-Vantaa Airport", x: 750, y: 290 },
  { ident: "LHR", name: "London Heathrow Airport", x: 310, y: 520 },
  { ident: "FRA", name: "Frankfurt Airport", x: 470, y: 580 },
  { ident: "AMS", name: "Amsterdam Schiphol Airport", x: 450, y: 530 },
  { ident: "MAD", name: "Madrid-Barajas Airport", x: 170, y: 820 },
  { ident: "FCO", name: "Rome Fiumicino Airport", x: 580, y: 800 },
  { ident: "VIE", name: "Vienna International Airport", x: 650, y: 630 },
  { ident: "BCN", name: "Barcelona-El Prat Airport", x: 280, y: 830 },
  { ident: "ZRH", name: "Zurich Airport", x: 510, y: 670 },
  { ident: "DUB", name: "Dublin Airport", x: 190, y: 465 },
  { ident: "CPH", name: "Copenhagen Airport", x: 540, y: 430 },
  { ident: "OSL", name: "Oslo Gardermoen Airport", x: 550, y: 330 },
  { ident: "BRU", name: "Brussels Airport", x: 420, y: 570 },
  { ident: "ARN", name: "Stockholm Arlanda Airport", x: 670, y: 330 },
  { ident: "CDG", name: "Charles de Gaulle Airport", x: 360, y: 610 },
  { ident: "LGW", name: "London Gatwick Airport", x: 320, y: 555 }
];

//DOM Elements
const modal = document.getElementById("modal");
const storyDiv = document.getElementById("storyText");
const playerNameInput = document.getElementById("playerNameInput");
const modalStartBtn = document.getElementById("modalStartBtn");
const gameScreen = document.getElementById("gameScreen");
const statusDiv = document.getElementById("status");
const eventsDiv = document.getElementById("events");
const optionsDiv = document.getElementById("options");
const fuelAmountInput = document.getElementById("fuelAmount");
const buyFuelBtn = document.getElementById("buyFuelBtn");
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

//Story
storyDiv.innerText = storyTextContent;

//Map Image
const mapImg = new Image();
mapImg.src = "image/Europe_Map.jpg"; // your map image path
mapImg.onload = () => drawMap();

//Player Info
modalStartBtn.addEventListener("click", ()=>{
    const name = playerNameInput.value.trim();
    if(!name){ alert("Enter your name"); return; }
    player.name = name;
    player.currentAirport = airports[0].ident;
    modal.style.display="none";
    gameScreen.classList.remove("hidden");
    startGame();
});

//Start Game
function startGame(){
    eventsDiv.innerHTML="";
    optionsDiv.innerHTML="";
    updateStatus();
    showAirportsInRange();
    drawMap();
}

//Distance
function getDistance(a, b){
    // simple Euclidean distance for manual x/y points
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx*dx + dy*dy);
}

//Update Status
function updateStatus(){
    const airport = airports.find(a=>a.ident===player.currentAirport);
    statusDiv.innerHTML = `<p><strong>Name:</strong> ${player.name}</p>
    <p><strong>Current Airport:</strong> ${airport.name}</p>
    <p><strong>Money:</strong> $${player.money}</p>
    <p><strong>Fuel:</strong> ${player.fuel} km</p>
    <p><strong>Luggage Found:</strong> ${player.luggageFound?"Yes":"No"}</p>`;
}

//Airports in Range
function showAirportsInRange(){
    optionsDiv.innerHTML="<p>Select next airport:</p>";
    const current = airports.find(a=>a.ident===player.currentAirport);
    let inRangeExists = false;
    airports.forEach(a=>{
        if(a.ident!==player.currentAirport){
            const dist = Math.floor(getDistance(current, a));
            if(dist <= player.fuel){
                inRangeExists = true;
                const btn = document.createElement("button");
                btn.className="optionBtn";
                btn.innerText = `${a.name} (${dist} km)`;
                btn.onclick = ()=> flyToAirport(a.ident, dist);
                optionsDiv.appendChild(btn);
            }
        }
    });
    if(!inRangeExists){
        eventsDiv.innerHTML+=`<div class="eventMessage">No airports in range. Game Over.</div>`;
        endGame();
    }
}

//Buy Fuel
buyFuelBtn.addEventListener("click", ()=>{
    const amount=Number(fuelAmountInput.value);
    if(amount>0 && amount<=player.money){
        player.fuel += amount*3;
        player.money -= amount;
        eventsDiv.innerHTML+=`<div class="eventMessage">⛽ Bought ${amount*2} km fuel for $${amount}</div>`;
        fuelAmountInput.value="";
        updateStatus();
        showAirportsInRange();
        drawMap();
    }else{ alert("Invalid amount or insufficient money"); }
});

//Fly Animation
function flyToAirport(destination, distance){
    const from = airports.find(a=>a.ident===player.currentAirport);
    const to = airports.find(a=>a.ident===destination);
    let progress = 0;
    const plane = setInterval(()=>{
        drawMap();
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress);
        ctx.strokeStyle="orange";
        ctx.lineWidth=3;
        ctx.stroke();
        progress += 0.05;
        if(progress >= 1){
            clearInterval(plane);
            player.fuel -= distance;
            player.currentAirport = destination;
            handleRandomEvents();
        }
    },30);
}

//Random Events
function handleRandomEvents(){
    const eventChance = Math.random();
    if(eventChance < 0.05){
        player.money = 0;
        eventsDiv.innerHTML += `<div class="eventMessage">😱 Pickpocket! All your money is gone!</div>`;
    } else if(eventChance < 0.50 && !player.luggageFound){
        player.luggageFound = true;
        animateGift();
        eventsDiv.innerHTML += `<div class="eventMessage">🎉 You found luggage! Return to starting airport to win.</div>`;
    } else if(eventChance < 0.8){
        const choice = Math.random() < 0.5 ? "money" : "fuel";
        if(choice === "money"){
            const reward = 150;
            player.money += reward;
            eventsDiv.innerHTML += `<div class="eventMessage">💰 Mystery box! You gained $${reward}.</div>`;
        } else {
            const rewardFuel = 150;
            player.fuel += rewardFuel;
            eventsDiv.innerHTML += `<div class="eventMessage">⛽ Mystery box! You gained ${rewardFuel} km fuel.</div>`;
        }
    }

    if(player.luggageFound && player.currentAirport===airports[0].ident){
        eventsDiv.innerHTML+=`<div class="eventMessage">🏆 Congratulations! You returned luggage. You Win!</div>`;
        endGame();
        return;
    }

    if(player.fuel<=0){
        eventsDiv.innerHTML+=`<div class="eventMessage">You ran out of fuel mid-flight! Game Over.</div>`;
        endGame();
        return;
    }

    updateStatus();
    showAirportsInRange();
    drawMap();
}

//Map Airports
function drawMap(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

    airports.forEach(a=>{
        const pos = { x: a.x, y: a.y };
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, 2*Math.PI);
        ctx.fillStyle = (a.ident===player.currentAirport)?"red":"blue";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle="black";
        ctx.font="12px Arial";
        ctx.fillText(a.ident, pos.x + 12, pos.y + 5);
    });
}

//Gift
function animateGift(){
    const airport = airports.find(a=>a.ident===player.currentAirport);
    const pos = { x: airport.x, y: airport.y };
    let yOffset = 0;
    const giftAnim = setInterval(()=>{
        drawMap();
        ctx.fillStyle="gold";
        ctx.font="24px Arial";
        ctx.fillText("🎁", pos.x, pos.y - yOffset);
        yOffset += 2;
        if(yOffset > 50) clearInterval(giftAnim);
    },30);
}

//End
function endGame(){
    optionsDiv.innerHTML="";
    const restartBtn = document.createElement("button");
    restartBtn.innerText = "Restart Game";
    restartBtn.style.padding="10px 20px";
    restartBtn.style.fontSize="16px";
    restartBtn.style.marginTop="10px";
    restartBtn.style.cursor="pointer";
    restartBtn.onclick = ()=>{
        player = {name:"", money:499, fuel:499, currentAirport:"", luggageFound:false};
        eventsDiv.innerHTML=""; optionsDiv.innerHTML=""; statusDiv.innerHTML="";
        playerNameInput.value=""; modal.style.display="flex"; gameScreen.classList.add("hidden");
    };
    eventsDiv.appendChild(restartBtn);
}