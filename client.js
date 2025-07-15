// === Game Inc. Single-Player Edition - Enhanced ===

/*
Features:
- Hire talent (programmers/influencers for games)
- 2 AI companies, compete on leaderboard
- Games give passive money, coding gives instant money only
- Random game names (Play.io, Dough.io, etc)
*/

// -- Game Config --
const config = {
    createGamePrice: 5000,
    createLawsuitPrice: 200000,
    debtLimit: 1000000,
    levels: {
        0: {name: 'Startup', startRank: 0, color: '#25C5FC'},
        1: {name: 'Indie', startRank: 100000, color: '#38FD2F'},
        2: {name: 'AA', startRank: 500000, color: '#ca30fd'},
        3: {name: 'AAA', startRank: 2000000, color: '#FFD700'}
    },
    employeeLimits: [2, 3, 4], // by quality
    influencerLimits: [1, 2, 2], // by quality
};

// -- AI Names and Game Names --
const adjectives = [
    "Super", "Mega", "Hyper", "Fast", "Cool", "Dough", "Play", "Fun", "Pixel", "Cyber", "Auto", "Cash", "Idle", "Power", "Star"
];
const endings = [
    "io", "X", "Prime", "Run", "World", "Tycoon", "Quest", "Mania", "Inc", "Zone", "Rush", "Saga", "Empire"
];
function randomGameName() {
    return (
        adjectives[Math.floor(Math.random() * adjectives.length)] +
        (Math.random() < 0.5 ? "" : adjectives[Math.floor(Math.random() * adjectives.length)]) +
        "." +
        endings[Math.floor(Math.random() * endings.length)]
    );
}
const aiNames = ["BotBox", "FutureWare", "CodeWorks", "DreamSoft", "SynthAI", "BitForge"];
function randomAIName(used = []) {
    let pool = aiNames.filter(n => !used.includes(n));
    return pool[Math.floor(Math.random() * pool.length)] || "AI";
}
function randomEmployeeName() {
    const first = ["Alex", "Chris", "Drew", "Jamie", "Morgan", "Taylor", "Jordan", "Casey", "Blake", "Sam"];
    const last = ["Smith", "Johnson", "Lee", "Brown", "Jones", "Davis", "Miller", "Wilson", "Moore", "King"];
    return first[Math.floor(Math.random() * first.length)] + " " + last[Math.floor(Math.random() * last.length)];
}

// -- Data Structures --
function createPlayerCompany() {
    return {
        id: 'local',
        name: '?',
        money: 10000,
        games: [],
        lawsuits: [],
        color: "#25C5FC"
    };
}
function createAICompany(name, color) {
    return {
        id: name,
        name,
        money: 8000 + Math.random() * 6000,
        games: [],
        lawsuits: [],
        color,
        ai: true,
    };
}

// -- State --
let company = createPlayerCompany();
let aiCompanies = [
    createAICompany(randomAIName([]), "#FFB300"),
    createAICompany(randomAIName([company.name]), "#4FC3F7"),
];
let leaderboard = [company, ...aiCompanies];
let leaderboardHistory = {};
leaderboard.forEach(c => leaderboardHistory[c.id] = [c.money]);
let companyProfiles = {};
leaderboard.forEach(c => companyProfiles[c.id] = c);
let leaderboardHistorySize = 90;
let chatOpen = false;
let emojisOpen = false;
let unreadMessages = 0;

// -- Sounds --
const chaChingSound = new Audio("./sounds/cha-ching.wav");
const createCompanySound = new Audio("./sounds/create-company.wav");
const createGameSound = new Audio("./sounds/create-game.wav");
const gameDoneSound = new Audio("./sounds/game-done.wav");

// -- Code Writing Logic --
let codeWriting = " ";
let codeIndex = 0;
const txtFile = new XMLHttpRequest();
txtFile.open("GET", "./hackerCode.txt", true);
txtFile.onreadystatechange = function () {
    if (txtFile.readyState === 4 && txtFile.status === 200) {
        codeWriting = txtFile.responseText;
    }
};
txtFile.send(null);

// -- UI Event Handlers (local) --
function startCompany() {
    const companyName = document.getElementById("companyNameInput").value || "My Company";
    company.name = companyName;
    presentStatus("Starting company...");
    setTimeout(() => {
        dismissModal();
        updateDisplay();
    }, 1000);
    // createCompanySound.play();
}
function validateCompanyName(value) {
    document.getElementById("startCompanyButton").disabled =
        value.length <= 3 || value.length > 30;
}
function createGame() {
    presentModal("createGameModal");
}
function finishCreateGame(quality) {
    if (company.money < config.createGamePrice) {
        presentStatus("Not enough money!");
        setTimeout(dismissModal, 1200);
        return;
    }
    company.money -= config.createGamePrice;
    company.games.push({
        name: randomGameName(),
        quality,
        linesOfCode: 0,
        totalLinesOfCode: 1000 * (quality + 1),
        employees: [],
        influencers: [],
        revenue: 0,
        revenueDecay: 0.05 + 0.05 * quality,
        rpm: 1 + quality,
        conversion: 0.05 + 0.02 * quality,
        hype: 100 * (quality + 1),
        startTime: Date.now(),
        completed: false,
        lastRevenue: Date.now()
    });
    presentStatus("Game created!");
    setTimeout(() => {
        dismissModal();
        updateDisplay();
    }, 1000);
    // createGameSound.play();
}
function createLawsuit() {
    presentStatus("Lawsuits are disabled in single player!");
    setTimeout(dismissModal, 1200);
}
function finishCreateLawsuit(size) {
    presentStatus("Lawsuits are disabled in single player!");
    setTimeout(dismissModal, 1200);
}

function hireTalent(type, game) {
    if (!game) return;
    // type: "game" or "influencer"
    // Generate 2 random employees and 1 "random" option
    let candidates = [];
    if (type === "game") {
        for (let i = 0; i < 2; ++i) {
            candidates.push({
                name: randomEmployeeName(),
                salary: 3000 + Math.floor(Math.random() * 4000),
                workSpeed: 17 + Math.random() * 11,
                hype: 7 + Math.random() * 6,
                levelId: Math.floor(Math.random() * 3),
                type: "game"
            });
        }
    } else {
        for (let i = 0; i < 2; ++i) {
            candidates.push({
                name: randomEmployeeName(),
                salary: 2500 + Math.floor(Math.random() * 4000),
                workSpeed: 0,
                hype: 40 + Math.floor(Math.random() * 90),
                levelId: Math.floor(Math.random() * 3),
                type: "influencer"
            });
        }
    }
    presentHireTalentModal(game, candidates, type);
}
function presentHireTalentModal(game, candidates, type) {
    const modal = document.getElementById("hireTalentModal");
    const holders = modal.getElementsByClassName("employeeHolder");
    for (let h of holders) while (h.firstChild) h.removeChild(h.firstChild);
    holders[0].appendChild(createEmployeeElement(candidates[0], type));
    holders[1].appendChild(createEmployeeElement(candidates[1], type));
    holders[2].appendChild(createEmployeeElement("random", type));
    // Set buttons
    const finishButtons = modal.querySelectorAll("button[onclick^='finishHireTalent']");
    finishButtons[0].onclick = () => finishHireTalent(game, candidates[0]);
    finishButtons[1].onclick = () => finishHireTalent(game, candidates[1]);
    finishButtons[2].onclick = () => finishHireTalent(game, {
        name: "Random",
        salary: 4000 + Math.floor(Math.random() * 3000),
        workSpeed: 12 + Math.random() * 9,
        hype: 20 + Math.random() * 30,
        levelId: Math.floor(Math.random() * 3),
        type
    });
    presentModal("hireTalentModal");
    presentStatus("Selecting employees...");
}
function finishHireTalent(game, employee) {
    dismissModal();
    if (employee.type === "game") {
        if (game.employees.length < config.employeeLimits[game.quality]) {
            game.employees.push(employee);
            company.money -= employee.salary;
        }
    } else {
        if (game.influencers.length < config.influencerLimits[game.quality]) {
            game.influencers.push(employee);
            company.money -= employee.salary;
        }
    }
    presentStatus("Talent hired!");
    setTimeout(dismissModal, 1000);
    updateDisplay();
}

// -- Passive Income: Games generate money, AI companies progress, loop --
function updatePassive() {
    // Player's games
    for (let game of company.games) {
        if (game.completed) {
            // Revenue decays slightly over time (simulate idle)
            let revenue = 5000 * (game.quality + 1);
            revenue += game.employees.reduce((sum, e) => sum + (e.workSpeed || 0), 0) * 10;
            revenue += game.influencers.reduce((sum, e) => sum + (e.hype || 0), 0) * 7;
            revenue *= 1 - game.revenueDecay;
            game.revenue = revenue;
            // Add revenue every second
            if (!game.lastRevenue || Date.now() - game.lastRevenue >= 1000) {
                company.money += revenue / 12; // monthly/12 per sec
                game.lastRevenue = Date.now();
            }
        } else {
            // Progress lines of code if there are employees
            let speed = game.employees.reduce((sum, e) => sum + (e.workSpeed || 0), 0);
            game.linesOfCode += speed / 10; // scale to per second
            if (game.linesOfCode >= game.totalLinesOfCode) {
                game.linesOfCode = game.totalLinesOfCode;
                game.completed = true;
                // gameDoneSound.play();
                setTimeout(() => {
                    presentStatus(`Your game "${game.name}" is live!`);
                    setTimeout(dismissModal, 1200);
                }, 200);
            }
        }
    }
    // AI companies
    for (let ai of aiCompanies) {
        // AI can hire employees and create games at intervals
        if (!ai.games.length || Math.random() < 0.015) {
            // Make new game
            ai.games.push({
                name: randomGameName(),
                quality: Math.floor(Math.random() * 3),
                linesOfCode: 0,
                totalLinesOfCode: 1000 * (Math.floor(Math.random() * 3) + 1),
                employees: [],
                influencers: [],
                revenue: 0,
                revenueDecay: 0.07 + 0.07 * Math.random(),
                rpm: 1 + Math.random() * 2,
                conversion: 0.05 + 0.03 * Math.random(),
                hype: 60 + Math.random() * 80,
                startTime: Date.now(),
                completed: false,
                lastRevenue: Date.now()
            });
            ai.money -= 5000 + Math.random() * 3000;
        }
        for (let game of ai.games) {
            if (game.completed) {
                // Add revenue
                let revenue = 4000 * (game.quality + 1);
                revenue += (Math.random() * 180);
                revenue *= 1 - game.revenueDecay;
                game.revenue = revenue;
                if (!game.lastRevenue || Date.now() - game.lastRevenue >= 1000) {
                    ai.money += revenue / 12;
                    game.lastRevenue = Date.now();
                }
            } else {
                // AI progress
                game.linesOfCode += 23 + Math.random() * 13;
                if (game.linesOfCode >= game.totalLinesOfCode) {
                    game.linesOfCode = game.totalLinesOfCode;
                    game.completed = true;
                }
            }
        }
        // AI randomly hires some employees/influencers
        for (let game of ai.games) {
            if (!game.completed && game.employees.length < config.employeeLimits[game.quality] && Math.random() < 0.03) {
                game.employees.push({
                    name: randomEmployeeName(),
                    salary: 2500 + Math.random() * 3200,
                    workSpeed: 13 + Math.random() * 21,
                    hype: 9 + Math.random() * 8,
                    levelId: Math.floor(Math.random() * 3)
                });
            }
            if (!game.completed && game.influencers.length < config.influencerLimits[game.quality] && Math.random() < 0.015) {
                game.influencers.push({
                    name: randomEmployeeName(),
                    salary: 2000 + Math.random() * 2000,
                    workSpeed: 0,
                    hype: 25 + Math.random() * 65,
                    levelId: Math.floor(Math.random() * 3)
                });
            }
        }
    }
    updateDisplay();
    setTimeout(updatePassive, 1000);
}
setTimeout(updatePassive, 1000);

// -- UI Rendering (updated for new features) --
function updateDisplay() {
    document.getElementById("companyNameDisplay").innerText = removeArrows(company.name);
    document.getElementById("companyLevelDisplay").innerText = removeArrows(
        Object.keys(config.levels)
            .map((i) => config.levels[i])
            .reverse()
            .find((e) => Math.max(company.money, 0) >= e.startRank).name
    );
    document.getElementById("moneyDisplay").innerText = numeral(company.money).format("$0,0");
    document.getElementById("createGameButton").disabled = company.money < config.createGamePrice;
    document.getElementById("createLawsuitButton").disabled = true; // always disabled
    updateGamesUI();
    updateMoneyPerSec();
    drawLeaderboard();
}
function updateGamesUI() {
    const overviewItems = company.games.concat(company.lawsuits).sort((a, b) => b.startTime - a.startTime);
    const overviewItemsList = document.getElementById("overviewItems");
    while (overviewItemsList.childElementCount > overviewItems.length) {
        overviewItemsList.removeChild(overviewItemsList.firstChild);
    }
    while (overviewItemsList.childElementCount < overviewItems.length) {
        overviewItemsList.appendChild(createOverviewItemElement());
    }
    for (let i = 0; i < overviewItems.length; i++) {
        const item = overviewItems[i];
        if (item.quality !== undefined) {
            updateGameElement(overviewItemsList.children[i], item);
        } else {
            updateLawsuitElement(overviewItemsList.children[i], item);
        }
    }
}
function updateMoneyPerSec() {
    let deltaMoney = company.games.reduce((sum, game) => {
        if (!game.completed) return sum;
        return sum + (game.revenue || 0);
    }, 0) / 12;
    document.getElementById("moneyPerSec").innerText = numeral(deltaMoney).format("$0,0") + "/sec";
    document.getElementById("moneyPerYear").innerText = numeral(deltaMoney * 365).format("$0,0") + "/year";
}

// -- Game UI --
function createOverviewItemElement() {
    const div = document.createElement("div");
    div.classList.add("game");
    const mainInfo = document.createElement("div");
    mainInfo.classList.add("mainInfo");
    div.appendChild(mainInfo);
    const logo = document.createElement("div");
    logo.classList.add("logo");
    mainInfo.appendChild(logo);
    const title = document.createElement("div");
    title.classList.add("title");
    mainInfo.appendChild(title);
    const subtitle = document.createElement("div");
    subtitle.classList.add("subtitle");
    mainInfo.appendChild(subtitle);
    const progress = createProgressBarElement(0.5);
    mainInfo.appendChild(progress);
    const employees = document.createElement("div");
    employees.classList.add("employees");
    div.appendChild(employees);
    const revStats = document.createElement("div");
    revStats.classList.add("revStats");
    div.appendChild(revStats);
    const revenue = document.createElement("div");
    revenue.classList.add("revenue");
    div.appendChild(revenue);
    // Hire talent buttons
    const hireTalentButton = document.createElement("button");
    hireTalentButton.classList.add("hireTalentButton");
    hireTalentButton.innerText = "Hire Programmer";
    hireTalentButton.onclick = () => hireTalent("game", div.gameRef);
    div.appendChild(hireTalentButton);
    const hireInfluencerButton = document.createElement("button");
    hireInfluencerButton.classList.add("hireTalentButton");
    hireInfluencerButton.innerText = "Hire Influencer";
    hireInfluencerButton.onclick = () => hireTalent("influencer", div.gameRef);
    div.appendChild(hireInfluencerButton);
    // Other employee list (not used now)
    const otherEmployees = document.createElement("div");
    otherEmployees.classList.add("employees");
    div.appendChild(otherEmployees);
    return div;
}
function updateGameElement(div, game) {
    div.gameRef = game;
    div.getElementsByClassName("title")[0].innerText = game.name;
    div.getElementsByClassName("title")[0].style.color = titleColors[game.quality];
    div.getElementsByClassName("subtitle")[0].innerText =
        numeral(game.linesOfCode).format("0,0") + "/" +
        numeral(game.totalLinesOfCode).format("0,0") + " lines of code";
    div.getElementsByClassName("logo")[0].innerText = gameTiers[game.quality];
    setProgress(div.getElementsByClassName("progress")[0], game.linesOfCode / game.totalLinesOfCode);
    setProgressColor(div.getElementsByClassName("progress")[0], progressColors[game.quality]);
    // Employees
    const employeeList = div.getElementsByClassName("employees")[0];
    while (employeeList.firstChild) employeeList.removeChild(employeeList.firstChild);
    for (let employee of game.employees) {
        employeeList.appendChild(createEmployeeElement(employee, "game"));
    }
    for (let influencer of game.influencers) {
        employeeList.appendChild(createEmployeeElement(influencer, "influencer"));
    }
    // Buttons
    div.getElementsByClassName("hireTalentButton")[0].disabled = game.employees.length >= config.employeeLimits[game.quality] || game.completed;
    div.getElementsByClassName("hireTalentButton")[1].disabled = game.influencers.length >= config.influencerLimits[game.quality] || game.completed;
    // Stats
    const revStats = div.getElementsByClassName("revStats")[0];
    const revenue = div.getElementsByClassName("revenue")[0];
    if (!game.completed) {
        revStats.innerText = "";
        revenue.innerText = "";
    } else {
        let followers = 100 * (game.quality + 1) + game.influencers.reduce((sum, inf) => sum + (inf.hype || 0), 0);
        revStats.innerText =
            numeral(followers).format("0.0a") + " followers\n" +
            numeral(game.conversion).format("0.0%") + " conversion\n" +
            numeral(game.rpm).format("$0,0.00") + " RPM\n" +
            numeral(game.revenueDecay).format("0.0%") + " decay/yr\n";
        revenue.innerText = numeral(game.revenue).format("$0,0") + "/yr";
    }
}
function updateLawsuitElement(div, lawsuit) {
    div.style.display = "none";
}
function createEmployeeElement(profile, type) {
    let employeeColor = profile.levelId !== undefined && config.levels[profile.levelId]
        ? config.levels[profile.levelId].color
        : "#000000";
    const div = document.createElement("div");
    div.classList.add("employee");
    const image = document.createElement("div");
    image.classList.add("image");
    image.style.backgroundImage =
        "url(profiles/" + (profile === "random" ? "Random" : encodeURI(profile.name)) + ".png)";
    div.appendChild(image);
    const infoHolder = document.createElement("div");
    infoHolder.classList.add("infoHolder");
    div.appendChild(infoHolder);
    const nameLabel = document.createElement("div");
    nameLabel.classList.add("label", "name");
    nameLabel.innerText = profile === "random" ? "Random" : profile.name;
    nameLabel.style.color = employeeColor;
    infoHolder.appendChild(nameLabel);
    const salaryLabel = document.createElement("div");
    salaryLabel.classList.add("label");
    salaryLabel.innerText =
        "Salary: " +
        (profile === "random" ? "?" : numeral(profile.salary).format("$0,0")) +
        "/year";
    infoHolder.appendChild(salaryLabel);
    if (type === "game") {
        const workSpeedLabel = document.createElement("div");
        workSpeedLabel.classList.add("label");
        workSpeedLabel.innerText = "Work speed: " +
            (profile === "random"
                ? "?"
                : numeral(profile.workSpeed).format("0,0")) + " loc/s";
        infoHolder.appendChild(workSpeedLabel);
    }
    if (type === "influencer") {
        const hypeLabel = document.createElement("div");
        hypeLabel.classList.add("label");
        hypeLabel.innerText =
            "Hype: " +
            (profile === "random"
                ? "?"
                : numeral(profile.hype).format("0.0a")) +
            " followers";
        infoHolder.appendChild(hypeLabel);
    }
    return div;
}
function createProgressBarElement(progress) {
    const div = document.createElement("div");
    div.classList.add("progress");
    const inner = document.createElement("div");
    inner.classList.add("progressInner");
    div.appendChild(inner);
    const centerLine = document.createElement("div");
    centerLine.classList.add("progressCenterLine");
    div.appendChild(centerLine);
    setProgress(div, progress);
    return div;
}
function setProgress(progressBarElement, progress) {
    progressBarElement.classList.remove("positiveNegative");
    const inner = progressBarElement.getElementsByClassName("progressInner")[0];
    inner.style.width = Math.round(progress * 100) + "%";
}
function setProgressColor(progressBarElement, color) {
    progressBarElement.getElementsByClassName("progressInner")[0].style.background = color;
}

// -- Code Writing Handler --
// Now, coding just gives money -- doesn't progress games
let lastKeyCode = undefined;
document.addEventListener("keydown", (e) => {
    if (e.code === lastKeyCode) return;
    lastKeyCode = e.code;
    if (!chatOpen) writeCode();
});
document.addEventListener("keyup", () => {
    lastKeyCode = undefined;
});
function writeCode() {
    if (hasModal() || document.activeElement instanceof HTMLInputElement) return;
    // Add code visually
    const codePanel = document.getElementById("codeArea");
    let appendText = "";
    let newText = document.createElement("span");
    newText.className = "code";
    for (let i = 0; i < 5; i++) {
        const char = codeWriting[codeIndex % codeWriting.length];
        appendText += char;
        codeIndex++;
        if (char === " ") i--;
    }
    newText.innerText = appendText;
    codePanel.appendChild(newText);
    if (document.getElementsByClassName("code").length > 500) {
        document.getElementsByClassName("code")[0].remove();
    }
    // Give money only
    company.money += 200 + Math.floor(Math.random() * 90);
    // chaChingSound.play();
    updateDisplay();
    finishedTip("code");
}

// -- Tips (unchanged) --
const allTips = [
    ["code", "Press buttons on the keyboard to write code and make money."],
    ["createGame", 'Click "New Game" to create a new game and start making more money. This costs $5,000.'],
    ["hireTalent", 'Click "Hire Programmer" to add a programmer to your team, or "Hire Influencer" to boost hype.'],
    ["dontClose", "Leave the page open in the background to keep gaining money while doing other things."],
];
let tipIndex = 0;
function finishedTip(key) {
    if (allTips[tipIndex][0] === key && tipIndex !== allTips.length - 1) {
        tipIndex++;
        renderTip();
    }
}
function renderTip() {
    document.getElementById("tipsBody").innerText = allTips[tipIndex][1];
}

// -- Modal Controller (unchanged) --
function hasModal() {
    return document.querySelector(".modal.present") !== null;
}
function presentModal(id) {
    dismissModal();
    document.getElementById(id).classList.add("present");
}
function dismissModal() {
    const modal = document.querySelector(".modal.present");
    if (modal !== null) modal.classList.remove("present");
}
function presentStatus(status) {
    document.getElementById("statusText").innerText = status;
    presentModal("statusModal");
}

// -- Chat (local only, no network) --
document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
        if (chatInput.value.trim() == "") {
            chatInput.value = "";
        } else {
            addToChat({msg: chatInput.value.trim()});
            chatInput.value = "";
        }
    }
});
function addToChat(chatObject) {
    let chatClient = document.getElementById("chatArea");
    let tmpMessage = document.createElement("div");
    tmpMessage.className = "chatMessage";
    chatObject.msg = chatObject.msg.replace(/\\:/g, ":");
    for (let i = 0; i < emojis.length; i++) {
        chatObject.msg = chatObject.msg.replace(
            new RegExp(`:${emojis[i]}:`, "g"),
            `<img class="inline" src="emojis/${emojis[i]}.png"></img>`,
        );
    }
    tmpMessage.innerHTML = chatObject.msg;
    chatClient.appendChild(tmpMessage);
    if (window.navigator.userAgent.indexOf("Edge") > -1) return;
    chatClient.scrollTo(0, chatClient.scrollHeight);
}
function openChat() {
    document.getElementById("codePanel").style.display = "none";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("chatInput").focus();
    chatOpen = true;
    if (window.navigator.userAgent.indexOf("Edge") > -1) return;
    document
        .getElementById("chatArea")
        .scrollTo(0, document.getElementById("chatArea").scrollHeight);
}
function closeChat() {
    document.getElementById("codePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "none";
    chatOpen = false;
    unreadMessages = 0;
    document.getElementById("unreadNotification").innerHTML = unreadMessages;
    if (document.getElementById("newMessages")) {
        document.getElementById("newMessages").remove();
    }
}

// -- Emoji UI --
function toggleEmojis() {
    if (emojisOpen) {
        document.getElementById("emojiList").style.display = "none";
        emojisOpen = false;
    } else {
        fillEmojis();
        document.getElementById("emojiList").style.display = "block";
        emojisOpen = true;
    }
}
function fillEmojis() {
    document.getElementById("emojiList").innerHTML = "";
    for (let tmpEmoji in emojis) {
        document.getElementById(
            "emojiList",
        ).innerHTML += `<img class="inline" src="emojis/${emojis[tmpEmoji]}.png"></img> :${emojis[tmpEmoji]}:<br>`;
    }
}

// -- Leaderboard (player + 2 AI) --
function drawLeaderboard() {
    // Update leaderboard history
    for (let c of leaderboard) {
        if (!leaderboardHistory[c.id]) leaderboardHistory[c.id] = [];
        leaderboardHistory[c.id].unshift(c.money);
        leaderboardHistory[c.id].length = leaderboardHistorySize;
    }
    const canvas = document.getElementById("leaderboardGraph");
    const w = Math.floor(window.innerWidth - 400);
    const h = Math.floor(window.innerHeight * 0.55 - 55);
    canvas.style.width = w;
    canvas.style.height = h;
    let minValue = Math.min(...Object.values(leaderboardHistory).flat().filter(x => typeof x === "number"));
    let maxValue = Math.max(...Object.values(leaderboardHistory).flat().filter(x => typeof x === "number"));
    minValue -= 1; maxValue += 1;
    const valueRange = maxValue - minValue;
    minValue -= valueRange * 0.2;
    maxValue += valueRange * 0.2;
    let lineEndW = w - 250;
    const step = lineEndW / leaderboardHistorySize + 1;
    let colorIndex = 0;
    const colors = ["#25C5FC", "#FFB300", "#4FC3F7"];
    let tmpText = "";
    for (let idx in leaderboard) {
        const c = leaderboard[idx];
        let points = [];
        for (let i = 0; i < leaderboardHistory[c.id].length - 1; i++) {
            if (typeof leaderboardHistory[c.id][i] !== "number") continue;
            points.push([
                lineEndW - i * step,
                adjustValue(leaderboardHistory[c.id][i], minValue, maxValue, h)
            ]);
        }
        if (points.length > 0) {
            tmpText += svgPath(points, bezierCommand, colors[idx], c.id === company.id ? 8 : 3);
            const money = numeral(leaderboardHistory[c.id][0]).format("$0.0a");
            tmpText += `<text x="${lineEndW + 10}" y="${adjustValue(
                leaderboardHistory[c.id][0], minValue, maxValue, h
            )}" font-weight="bold" font-family="Biryani" fill="${colors[idx]}" font-size="12">(${
                money}) ${removeArrows(c.name)}</text>`;
        }
    }
    canvas.innerHTML = tmpText;
}
function adjustValue(value, min, max, height) {
    return height - ((value - min) / (max - min)) * height;
}
const line = (pointA, pointB) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
    };
};
const controlPoint = (current, previous, next, reverse) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};
const svgPath = (points, command, color, width) => {
    const d = points.reduce(
        (acc, point, i, a) =>
            i === 0
                ? `M ${point[0]},${point[1]}`
                : `${acc} ${command(point, i, a)}`,
        "",
    );
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" />`;
};
const bezierCommand = (point, i, a) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};
const removeArrows = (text) => text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

// -- Misc --
Element.prototype.remove = function () { this.parentElement.removeChild(this); };
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

// -- On Load --
window.addEventListener("load", () => {
    renderTip();
    updateDisplay();
});

// -- Prevent losing progress --
window.addEventListener("beforeunload", (e) => {
    const confirmationMessage = "Are you sure you want to leave? You will lose your progress.";
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
});
