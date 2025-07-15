// Variables simulées
let company = {
  name: "?",
  money: 0,
};
let config = {
  createGamePrice: 5000,
  createLawsuitPrice: 200000,
  debtLimit: -100000,
  levels: {
    1: { name: "Startup", startRank: 0 },
    2: { name: "Incubator", startRank: 50000 },
    3: { name: "Unicorn", startRank: 100000 },
  },
};

// Simulation de revenus par seconde
setInterval(() => {
  if (company.name !== "?") {
    company.money += 200;
    updateUI();
  }
}, 1000);

// Fonction pour démarrer une entreprise
function startCompany() {
  const name = document.getElementById("companyNameInput").value.trim();
  if (name.length < 3) return alert("Company name too short");
  company.name = name;
  company.money = 10000;
  document.getElementById("startCompanyModal").classList.remove("present");
  updateUI();
}

// Mise à jour de l'affichage
function updateUI() {
  document.getElementById("companyNameDisplay").innerText = company.name;
  document.getElementById("moneyDisplay").innerText = "$" + company.money.toLocaleString();
  document.getElementById("moneyPerSec").innerText = "$200/sec";
  document.getElementById("moneyPerYear").innerText = "$73,000/year";

  const level = Object.values(config.levels).reverse().find(l => company.money >= l.startRank);
  document.getElementById("companyLevelDisplay").innerText = level.name;

  document.getElementById("createGameButton").disabled = company.money < config.createGamePrice;
  document.getElementById("createLawsuitButton").disabled = company.money < config.createLawsuitPrice;
}

// Actions boutons
function createGame() {
  if (company.money >= config.createGamePrice) {
    company.money -= config.createGamePrice;
    alert("You started a new game!");
    updateUI();
  }
}

function createLawsuit() {
  if (company.money >= config.createLawsuitPrice) {
    company.money -= config.createLawsuitPrice;
    alert("You launched a lawsuit!");
    updateUI();
  }
}

// Simulation de frappe clavier (code)
let codeIndex = 0;
let codeWriting = "function game() { console.log('dev money'); } ";
document.addEventListener("keydown", () => {
  if (company.name === "?") return;
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

// Optionnel : validation du nom
function validateCompanyName(value) {
  document.getElementById("startCompanyButton").disabled = value.trim().length < 3;
}
