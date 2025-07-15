// Variables simulées
let company = {
    name: "MyCompany",
    money: 10000,
};
let config = {
    createGamePrice: 5000,
    createLawsuitPrice: 200000,
    debtLimit: 100000,
    levels: {
        1: { name: "Startup", startRank: 0 },
        2: { name: "Incubator", startRank: 50000 },
        3: { name: "Unicorn", startRank: 100000 },
    },
};

// Simuler de l'argent qui augmente
setInterval(() => {
    company.money += 200;
    updateUI();
}, 1000);

// UI
function updateUI() {
    document.getElementById("moneyDisplay").innerText = "$" + company.money.toLocaleString();
    document.getElementById("moneyPerSec").innerText = "$200/sec";
    document.getElementById("moneyPerYear").innerText = "$73,000/year";

    document.getElementById("companyNameDisplay").innerText = company.name;
    const level = Object.values(config.levels)
        .reverse()
        .find(l => company.money >= l.startRank);
    document.getElementById("companyLevelDisplay").innerText = level.name;

    document.getElementById("createGameButton").disabled = company.money < config.createGamePrice;
    document.getElementById("createLawsuitButton").disabled = company.money < config.createLawsuitPrice;
}

function createGame() {
    if (company.money >= config.createGamePrice) {
        company.money -= config.createGamePrice;
        alert("Game created!");
    }
}

function createLawsuit() {
    if (company.money >= config.createLawsuitPrice) {
        company.money -= config.createLawsuitPrice;
        alert("Lawsuit created!");
    }
}

// Fake keyboard code writing
let codeIndex = 0;
let codeWriting = "function develop() { console.log('making money'); } ";
document.addEventListener("keydown", () => {
    const codePanel = document.getElementById("codeArea");
    const span = document.createElement("span");
    span.innerText = codeWriting[codeIndex % codeWriting.length];
    span.className = "code";
    codePanel.appendChild(span);
    codeIndex++;
    company.money += 50;
    updateUI();

    if (codePanel.children.length > 500) {
        codePanel.removeChild(codePanel.children[0]);
    }
});

updateUI();
