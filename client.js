// === Game Inc. Single-Player Edition ===
// Removes all multiplayer/socket.io logic, simulates everything locally

// -- Game Config (simulate what server would send) --
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
    employeeLimits: [2, 3, 4],
    lawyerLimits: [1, 2, 3]
};

// -- Game Data State --
let company = {
    id: 'local',
    name: '?',
    money: 10000,
    games: [],
    lawsuits: [],
};
let leaderboard = [company];
let leaderboardHistory = { local: [company.money] };
let companyProfiles = { local: company };
let leaderboardHistorySize = 90;
let chatOpen = false;
let emojisOpen = false;
let unreadMessages = 0;

// -- Misc UI State --
const gameTiers = ["🌐", "📱️", "🎮"];
const lawsuitTiers = ["💵", "💰️", "🏦"];
const progressColors = [
    "linear-gradient(to right, #1783FB, #4CD8FC)",
    "linear-gradient(to right, #52B05C, #38FD2F)",
    "linear-gradient(to right, #9954b0, #ca30fd)",
];
const titleColors = ["#25C5FC", "#38FD2F", "#ca30fd"];
const emojis = [
    "b","madman","smile","grin","lmao","cool","relief","laughing",
    "good","evil","wink","nothing","wowok","envy","weary","tired",
    "confused","frustrated","kiss","kiss_heart","kiss_closed_eyes",
    "angry","angery","cry","misery","triumph","crysad","oh","surprized",
    "awe","yawn","embarassed","scared","jaw_drop","embarassing","sleep",
    "dizzy","speechless","mask","sad","happy","upsidedown","rolling",
    "blush","yum","satisfaction","hearteyes","sunglasses","smirk",
    "kiss_pls","tongue","wink_tongue","stuck_out","sad_peep",
    "more_sad_peep","snot","oof","yeesh","waterfall","o","owo","wet",
    "poop","100","eggplant","peach"
];

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
        name: `Game ${company.games.length + 1}`,
        quality,
        linesOfCode: 0,
        totalLinesOfCode: 1000 * (quality + 1),
        employees: [],
        revenue: 0,
        revenueDecay: 0.05 + 0.05 * quality,
        rpm: 1 + quality,
        conversion: 0.05 + 0.02 * quality,
        hype: 100 * (quality + 1),
        startTime: Date.now(),
        completed: false,
    });
    presentStatus("Game created!");
    setTimeout(() => {
        dismissModal();
        updateDisplay();
    }, 1000);
    // createGameSound.play();
}
function createLawsuit() {
    // Not implemented in single-player
    presentStatus("Lawsuits are disabled in single player!");
    setTimeout(dismissModal, 1200);
}
function finishCreateLawsuit(size) {
    presentStatus("Lawsuits are disabled in single player!");
    setTimeout(dismissModal, 1200);
}
function hireTalent(type, target) {
    presentStatus("Talent hiring is disabled in single player!");
    setTimeout(dismissModal, 1000);
}
function finishHireTalent(index) {
    presentStatus("Talent hiring is disabled in single player!");
    setTimeout(dismissModal, 1000);
}

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
    // Combine games and lawsuits (none for single player)
    const overviewItems = company.games
        .concat(company.lawsuits)
        .sort((a, b) => b.startTime - a.startTime);
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
    }, 0) / 12; // estimate per second
    document.getElementById("moneyPerSec").innerText = numeral(deltaMoney).format("$0,0") + "/sec";
    document.getElementById("moneyPerYear").innerText = numeral(deltaMoney * 365).format("$0,0") + "/year";
}

// -- UI Rendering (mostly unchanged) --
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
    const hireTalentButton = document.createElement("button");
    hireTalentButton.classList.add("hireTalentButton");
    hireTalentButton.innerText = "Hire Talent";
    hireTalentButton.disabled = true;
    div.appendChild(hireTalentButton);
    const otherEmployees = document.createElement("div");
    otherEmployees.classList.add("employees");
    div.appendChild(otherEmployees);
    return div;
}
function updateGameElement(div, game) {
    div.getElementsByClassName("title")[0].innerText = game.name + ".io";
    div.getElementsByClassName("title")[0].style.color = titleColors[game.quality];
    div.getElementsByClassName("subtitle")[0].innerText =
        numeral(game.linesOfCode).format("0,0") +
        "/" +
        numeral(game.totalLinesOfCode).format("0,0") +
        " lines of code";
    div.getElementsByClassName("logo")[0].innerText = gameTiers[game.quality];
    div.getElementsByClassName("hireTalentButton")[0].onclick = () => {};
    div.getElementsByClassName("hireTalentButton")[0].disabled = true;
    setProgress(div.getElementsByClassName("progress")[0], game.linesOfCode / game.totalLinesOfCode);
    setProgressColor(div.getElementsByClassName("progress")[0], progressColors[game.quality]);
    div.getElementsByClassName("employees")[1].hidden = true;
    const employeeList = div.getElementsByClassName("employees")[0];
    while (employeeList.firstChild) employeeList.removeChild(employeeList.firstChild);
    const revStats = div.getElementsByClassName("revStats")[0];
    const revenue = div.getElementsByClassName("revenue")[0];
    if (game.linesOfCode < game.totalLinesOfCode) {
        revStats.innerText = "";
        revenue.innerText = "";
    } else {
        if (!game.completed) {
            game.completed = true;
            // gameDoneSound.play();
            setTimeout(() => {
                presentStatus(`Your game "${game.name}" is live!`);
                setTimeout(dismissModal, 1200);
            }, 200);
            game.revenue = 5000 * (game.quality + 1) * (0.8 + Math.random() * 0.4);
        }
        let followers = 100 * (game.quality + 1);
        revStats.innerText =
            numeral(followers).format("0.0a") +
            " followers\n" +
            numeral(game.conversion).format("0.0%") +
            " conversion\n" +
            numeral(game.rpm).format("$0,0.00") +
            " RPM\n" +
            numeral(game.revenueDecay).format("0.0%") +
            " decay/yr\n";
        revenue.innerText = numeral(game.revenue).format("$0,0") + "/yr";
    }
}
function updateLawsuitElement(div, lawsuit) {
    div.style.display = "none";
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
    // Progress game development
    let anyInProgress = false;
    for (let g of company.games) {
        if (g.linesOfCode < g.totalLinesOfCode) {
            g.linesOfCode += 30 + 10 * g.quality;
            if (g.linesOfCode > g.totalLinesOfCode) g.linesOfCode = g.totalLinesOfCode;
            anyInProgress = true;
            break;
        }
    }
    // Money for work!
    let delta = 200 + Math.floor(Math.random() * 90);
    if (!anyInProgress) delta = 50 + Math.floor(Math.random() * 40);
    company.money += delta;
    // chaChingSound.play();
    updateDisplay();
    finishedTip("code");
}

// -- Tips (unchanged) --
const allTips = [
    ["code", "Press buttons on the keyboard to write code and make money."],
    ["createGame", 'Click "New Game" to create a new game and start making more money. This costs $5,000.'],
    ["hireTalent", 'Click "Hire Talent" to add a programmer to start developing the game.'],
    ["hireTalent", 'Click "Hire Talent" again to hire an influencer to increase the value of the game before release.'],
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

// -- Leaderboard (single player: just your company) --
function drawLeaderboard() {
    // Collect values (just yourself)
    leaderboardHistory.local.unshift(company.money);
    leaderboardHistory.local.length = leaderboardHistorySize;
    const canvas = document.getElementById("leaderboardGraph");
    const w = Math.floor(window.innerWidth - 400);
    const h = Math.floor(window.innerHeight * 0.55 - 55);
    canvas.style.width = w;
    canvas.style.height = h;
    let minValue = Math.min(...leaderboardHistory.local);
    let maxValue = Math.max(...leaderboardHistory.local);
    minValue -= 1; maxValue += 1;
    const valueRange = maxValue - minValue;
    minValue -= valueRange * 0.2;
    maxValue += valueRange * 0.2;
    let points = [];
    let lineEndW = w - 250;
    const step = lineEndW / leaderboardHistorySize + 1;
    for (let i = 0; i < leaderboardHistory.local.length - 1; i++) {
        if (typeof leaderboardHistory.local[i] !== "number") continue;
        points.push([
            lineEndW - i * step,
            adjustValue(leaderboardHistory.local[i], minValue, maxValue, h)
        ]);
    }
    let tmpText = "";
    if (points.length > 0) {
        tmpText += svgPath(points, bezierCommand, "Blue", 8);
        const money = numeral(leaderboardHistory.local[0]).format("$0.0a");
        tmpText += `<text x="${lineEndW + 10}" y="${adjustValue(
            leaderboardHistory.local[0], minValue, maxValue, h
        )}" font-weight="bold" font-family="Biryani" fill="Blue" font-size="12">(${
            money}) ${removeArrows(company.name)}</text>`;
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
