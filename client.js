// === Game Inc. Single-Player Edition with AI, Hiring, Employee List, and Salary Display (no HTML change needed) ===

// -- Game Config & Utilities --
const config = {
    createGamePrice: 5000,
    employeeLimits: [2, 3, 4],   // per game quality
    influencerLimits: [1, 2, 2], // per game quality
    debtLimit: 1000000,
    levels: {
        0: {name: 'Startup', startRank: 0, color: '#25C5FC'},
        1: {name: 'Indie', startRank: 100000, color: '#38FD2F'},
        2: {name: 'AA', startRank: 500000, color: '#ca30fd'},
        3: {name: 'AAA', startRank: 2000000, color: '#FFD700'}
    }
};

const gameTiers = ["🌐", "📱️", "🎮"];
const titleColors = ["#25C5FC", "#38FD2F", "#ca30fd"];
const progressColors = [
    "linear-gradient(to right, #1783FB, #4CD8FC)",
    "linear-gradient(to right, #52B05C, #38FD2F)",
    "linear-gradient(to right, #9954b0, #ca30fd)",
];
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
function randomEmployeeName() {
    const first = ["Alex", "Chris", "Drew", "Jamie", "Morgan", "Taylor", "Jordan", "Casey", "Blake", "Sam"];
    const last = ["Smith", "Johnson", "Lee", "Brown", "Jones", "Davis", "Miller", "Wilson", "Moore", "King"];
    return first[Math.floor(Math.random() * first.length)] + " " + last[Math.floor(Math.random() * last.length)];
}
const aiNames = ["BotBox", "FutureWare", "CodeWorks", "DreamSoft", "SynthAI", "BitForge"];
function randomAIName(used = []) {
    let pool = aiNames.filter(n => !used.includes(n));
    return pool[Math.floor(Math.random() * pool.length)] || "AI";
}

// -- State --
function createPlayerCompany() {
    return {
        id: 'local',
        name: '?',
        money: 10000,
        games: [],
        color: "#25C5FC",
        isAI: false
    };
}
function createAICompany(name, color) {
    return {
        id: name,
        name,
        money: 8000 + Math.random() * 6000,
        games: [],
        color,
        isAI: true
    };
}
let company = createPlayerCompany();
let aiCompanies = [
    createAICompany(randomAIName([]), "#FFB300"),
    createAICompany(randomAIName([company.name]), "#4FC3F7"),
];
let leaderboard = [company, ...aiCompanies];
let leaderboardHistory = {};
leaderboard.forEach(c => leaderboardHistory[c.id] = [c.money]);
let leaderboardHistorySize = 90;
let chatOpen = false;
let emojisOpen = false;
let unreadMessages = 0;

// -- Passive Update Loop --
function updatePassive() {
    // Player's games: employee progress and passive income
    for (let game of company.games) {
        if (!game.completed) {
            let speed = game.employees.reduce((sum, e) => sum + (e.workSpeed || 0), 0);
            game.linesOfCode += speed / 10;
            if (game.linesOfCode >= game.totalLinesOfCode) {
                game.linesOfCode = game.totalLinesOfCode;
                game.completed = true;
                setTimeout(() => {
                    presentStatus(`Your game "${game.name}" is live!`);
                    setTimeout(dismissModal, 1200);
                }, 200);
            }
        }
        if (game.completed) {
            let base = 5000 * (game.quality + 1);
            base += game.employees.reduce((sum, e) => sum + (e.workSpeed || 0), 0) * 10;
            base += game.influencers.reduce((sum, e) => sum + (e.hype || 0), 0) * 7;
            base *= 1 - game.revenueDecay;
            game.revenue = base;
            if (!game.lastRevenue || Date.now() - game.lastRevenue >= 1000) {
                company.money += base / 12;
                game.lastRevenue = Date.now();
            }
        }
    }
    // AI companies
    for (let ai of aiCompanies) {
        if (!ai.games.length || Math.random() < 0.015) {
            ai.games.push({
                name: randomGameName(),
                quality: Math.floor(Math.random() * 3),
                linesOfCode: 0,
                totalLinesOfCode: 1000 * (Math.floor(Math.random() * 3) + 1),
                employees: [],
                influencers: [],
                revenue: 0,
                revenueDecay: 0.07 + 0.07 * Math.random(),
                completed: false,
                lastRevenue: Date.now()
            });
            ai.money -= 5000 + Math.random() * 3000;
        }
        for (let game of ai.games) {
            if (!game.completed) {
                let speed = game.employees.reduce((sum, e) => sum + (e.workSpeed || 0), 0);
                if (speed === 0 || Math.random() < 0.2) {
                    if (game.employees.length < config.employeeLimits[game.quality] && Math.random() < 0.2) {
                        game.employees.push({
                            name: randomEmployeeName(),
                            salary: 2500 + Math.random() * 3200,
                            workSpeed: 13 + Math.random() * 21,
                            hype: 9 + Math.random() * 8,
                            levelId: Math.floor(Math.random() * 3)
                        });
                        ai.money -= 1800 + Math.random() * 1200;
                    }
                }
                game.linesOfCode += (speed || (15 + Math.random() * 10));
                if (game.linesOfCode >= game.totalLinesOfCode) {
                    game.linesOfCode = game.totalLinesOfCode;
                    game.completed = true;
                }
            }
            if (game.completed && game.influencers.length < config.influencerLimits[game.quality] && Math.random() < 0.1) {
                game.influencers.push({
                    name: randomEmployeeName(),
                    salary: 1500 + Math.random() * 2000,
                    workSpeed: 0,
                    hype: 25 + Math.random() * 65,
                    levelId: Math.floor(Math.random() * 3)
                });
                ai.money -= 1500 + Math.random() * 1200;
            }
            if (game.completed) {
                let base = 4000 * (game.quality + 1);
                base += game.employees.reduce((sum, e) => sum + (e.workSpeed || 0), 0) * 10;
                base += game.influencers.reduce((sum, e) => sum + (e.hype || 0), 0) * 7;
                base *= 1 - game.revenueDecay;
                game.revenue = base;
                if (!game.lastRevenue || Date.now() - game.lastRevenue >= 1000) {
                    ai.money += base / 12;
                    game.lastRevenue = Date.now();
                }
            }
        }
    }
    updateDisplay();
    setTimeout(updatePassive, 1000);
}
setTimeout(updatePassive, 1000);

// -- UI Functions (Hire, Game Creation, etc) --
function startCompany() {
    const companyName = document.getElementById("companyNameInput").value || "My Company";
    company.name = companyName;
    presentStatus("Starting company...");
    setTimeout(() => {
        dismissModal();
        updateDisplay();
    }, 1000);
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
        completed: false,
        lastRevenue: Date.now(),
        startTime: Date.now()
    });
    presentStatus("Game created!");
    setTimeout(() => {
        dismissModal();
        updateDisplay();
    }, 1000);
}
function hireTalent(type, game) {
    if (!game) return;
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
        presentStatus("Selecting employees...");
    // Fill employeeHolders with candidates
    const holders = document.getElementsByClassName("employeeHolder");
    for (let h of holders) while (h.firstChild) h.removeChild(h.firstChild);
    holders[0].appendChild(createEmployeeElement(candidates[0], type));
    holders[1].appendChild(createEmployeeElement(candidates[1], type));
    holders[2].appendChild(createEmployeeElement("random", type));
    // Attach handlers only after DOM is ready and buttons exist
    setTimeout(() => {
        const hireBtns = document.querySelectorAll("#hireTalentModal .finishCreateLawsuitButton");
        if (hireBtns.length >= 3) {
            hireBtns[0].onclick = () => finishHireTalent(game, candidates[0]);
            hireBtns[1].onclick = () => finishHireTalent(game, candidates[1]);
            hireBtns[2].onclick = () => finishHireTalent(game, {
                name: "Random",
                salary: 4000 + Math.floor(Math.random() * 3000),
                workSpeed: 12 + Math.random() * 9,
                hype: 20 + Math.random() * 30,
                levelId: Math.floor(Math.random() * 3),
                type
            });
        }
    }, 0);
    presentModal("hireTalentModal");
}
function finishHireTalent(game, employee) {
    dismissModal();
    if (employee.type === "game") {
        if (game.employees.length < config.employeeLimits[game.quality] && !game.completed) {
            game.employees.push(employee);
            company.money -= employee.salary;
        }
    } else {
        if (game.influencers.length < config.influencerLimits[game.quality] && !game.completed) {
            game.influencers.push(employee);
            company.money -= employee.salary;
        }
    }
    presentStatus("Talent hired!");
    setTimeout(dismissModal, 1000);
    updateDisplay();
}

// -- Employee List Output (in chat area for this HTML) --
function updateEmployeeList() {
    let employees = [];
    for (const game of company.games) {
        for (const prog of game.employees || []) {
            employees.push({
                name: prog.name,
                type: "Programmer",
                lines: prog.workSpeed || 0,
                followers: 0,
                salary: prog.salary || 0
            });
        }
        for (const inf of game.influencers || []) {
            employees.push({
                name: inf.name,
                type: "Influencer",
                lines: 0,
                followers: inf.hype || 0,
                salary: inf.salary || 0
            });
        }
    }
    let msg = "👥 <b>My Team</b><br><table style='width:100%'><tr><th>Name</th><th>Type</th><th>Lines/sec</th><th>Followers</th><th>Price</th></tr>";
    if (employees.length === 0) {
        msg += "<tr><td colspan='5'>No team members yet!</td></tr>";
    } else {
        for (const emp of employees) {
            let pricePerSec = emp.salary ? (emp.salary / 365 / 24 / 60 / 60).toFixed(2) : "";
            msg += `<tr>
                <td>${emp.name}</td>
                <td>${emp.type}</td>
                <td>${emp.lines > 0 ? emp.lines.toFixed(1) : ""}</td>
                <td>${emp.followers > 0 ? emp.followers : ""}</td>
                <td>${pricePerSec ? pricePerSec + "$/sec" : ""}</td>
            </tr>`;
        }
    }
    msg += "</table>";
    addToChat({msg});
}

// -- UI Rendering (Overview, Employees, Leaderboard, etc) --
function updateDisplay() {
    document.getElementById("companyNameDisplay").innerText = company.name;
    document.getElementById("companyLevelDisplay").innerText = Object.keys(config.levels)
        .map((i) => config.levels[i])
        .reverse()
        .find((e) => Math.max(company.money, 0) >= e.startRank).name;
    document.getElementById("moneyDisplay").innerText = numeral(company.money).format("$0,0");
    document.getElementById("createGameButton").disabled = company.money < config.createGamePrice;
    updateGamesUI();
    updateMoneyPerSec();
    drawLeaderboard();
}
function updateGamesUI() {
    const overviewItems = company.games.slice().sort((a, b) => b.startTime - a.startTime);
    const overviewItemsList = document.getElementById("overviewItems");
    while (overviewItemsList.childElementCount > overviewItems.length) {
        overviewItemsList.removeChild(overviewItemsList.firstChild);
    }
    while (overviewItemsList.childElementCount < overviewItems.length) {
        overviewItemsList.appendChild(createOverviewItemElement());
    }
    for (let i = 0; i < overviewItems.length; i++) {
        updateGameElement(overviewItemsList.children[i], overviewItems[i]);
    }
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
    // Employees & Influencers
    const employeeList = div.getElementsByClassName("employees")[0];
    while (employeeList.firstChild) employeeList.removeChild(employeeList.firstChild);
    for (const employee of game.employees) {
        employeeList.appendChild(createEmployeeElement(employee, "game"));
    }
    for (const influencer of game.influencers) {
        employeeList.appendChild(createEmployeeElement(influencer, "influencer"));
    }
    // Buttons
    let hireBtns = div.getElementsByClassName("hireTalentButton");
    if (hireBtns.length === 0) {
        let hireProg = document.createElement("button");
        hireProg.classList.add("hireTalentButton");
        hireProg.innerText = "Hire Programmer";
        hireProg.onclick = () => hireTalent("game", div.gameRef);
        div.appendChild(hireProg);
        let hireInf = document.createElement("button");
        hireInf.classList.add("hireTalentButton");
        hireInf.innerText = "Hire Influencer";
        hireInf.onclick = () => hireTalent("influencer", div.gameRef);
        div.appendChild(hireInf);
    } else {
        hireBtns[0].disabled = game.employees.length >= config.employeeLimits[game.quality] || game.completed;
        hireBtns[1].disabled = game.influencers.length >= config.influencerLimits[game.quality] || game.completed;
    }
    const revStats = div.getElementsByClassName("revStats")[0];
    const revenue = div.getElementsByClassName("revenue")[0];
    if (!game.completed) {
        revStats.innerText = "";
        revenue.innerText = "";
    } else {
        let followers = 100 * (game.quality + 1) + game.influencers.reduce((sum, inf) => sum + (inf.hype || 0), 0);
        revStats.innerText =
            numeral(followers).format("0.0a") + " followers\n" +
            numeral(game.revenueDecay).format("0.0%") + " decay/yr\n";
        revenue.innerText = numeral(game.revenue).format("$0,0") + "/yr";
    }
}
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
    return div;
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
function updateMoneyPerSec() {
    let deltaMoney = company.games.reduce((sum, game) => {
        if (!game.completed) return sum;
        return sum + (game.revenue || 0);
    }, 0) / 12;
    document.getElementById("moneyPerSec").innerText = numeral(deltaMoney).format("$0,0") + "/sec";
    document.getElementById("moneyPerYear").innerText = numeral(deltaMoney * 365).format("$0,0") + "/year";
}

// -- Leaderboard Rendering (unchanged) --
function drawLeaderboard() {
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
                money}) ${c.name}</text>`;
        }
    }
    canvas.innerHTML = tmpText;
}
function adjustValue(value, min, max, height) {
    return height - ((value - min) / (max - min)) * height;
}
function line(pointA, pointB) {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
    };
}
function controlPoint(current, previous, next, reverse) {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
}
function svgPath(points, command, color, width) {
    const d = points.reduce(
        (acc, point, i, a) =>
            i === 0
                ? `M ${point[0]},${point[1]}`
                : `${acc} ${command(point, i, a)}`,
        "",
    );
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" />`;
}
function bezierCommand(point, i, a) {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
}

// -- Code Writing Handler: Only gives money --
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
    updateDisplay();
}

// -- Modal Helpers --
function presentStatus(status) {
    document.getElementById("statusText").innerText = status;
    presentModal("statusModal");
}
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

// -- Chat & Team List Command (no HTML edit needed) --
function addToChat(chatObject) {
    let chatClient = document.getElementById("chatArea");
    let tmpMessage = document.createElement("div");
    tmpMessage.className = "chatMessage";
    tmpMessage.innerHTML = chatObject.msg;
    chatClient.appendChild(tmpMessage);
    if (window.navigator.userAgent.indexOf("Edge") > -1) return;
    chatClient.scrollTo(0, chatClient.scrollHeight);
}

// Allow showing team list using "team" keyword in chat for convenience
document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
        if (chatInput.value.trim() == "") {
            chatInput.value = "";
        } else if (chatInput.value.trim().toLowerCase() === "team") {
            updateEmployeeList();
            chatInput.value = "";
        } else {
            addToChat({msg: chatInput.value.trim()});
            chatInput.value = "";
        }
    }
});

// -- On Load --
window.addEventListener("load", () => {
    updateDisplay();
});

// -- Prevent losing progress --
window.addEventListener("beforeunload", (e) => {
    const confirmationMessage = "Are you sure you want to leave? You will lose your progress.";
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
});
