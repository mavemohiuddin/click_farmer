document.addEventListener('DOMContentLoaded', () => {

  let STATS = {
    playerClicks: 0,
    playerMined: 0,
    autoClicks: 0,
    autoMined: 0,
  }
  let UPGRADES = {
    clickPower: 1,
    clickPowerLevel: 1,
    clickMultiplier: 1,
    clickMultiplierLevel: 1,
    clickCount: 1,
    clickCountLevel: 1,
    autoClicker: 0,
    autoClickerLevel: 1,
    autoClickerInterval: 1000,
    autoClickerIntervalLevel: 1,
    autoClickerMultiplier: 1,
    autoClickerMultiplierLevel: 1,
    autoClickerCount: 1,
    autoClickerCountLevel: 1,
    autoClickerAllowBuff: 0,
    buffChance: 0,
    buffChanceLevel: 1,
    buffPower: 1,
    buffPowerLevel: 1,
    buffMultiplier: 1,
    buffMultiplierLevel: 1,
  };

  const CONFIG = {
    clickPower: {
      baseCost: 10,
      costGrowth: 1.15,
      type: "plus",
      power: 1,
      powerGrowth: 0.33,
      levels: ["clickPowerLevel", "clickPower"]
    },
    clickMultiplier: {
      baseCost: 20,
      costGrowth: 1.15,
      type: "range",
      power: 1,
      powerGrowth: [0.1, 0.2],
      levels: ["clickMultiplierLevel", "clickMultiplier"]
    },
    clickCount: {
      baseCost: 100,
      costGrowth: 2,
      type: "plus",
      power: 1,
      powerGrowth: 1,
      levels: ["clickCountLevel", "clickCount"]
    },
    autoClickerPower: {
      baseCost: 15,
      costGrowth: 1.2,
      type: "plus",
      power: 0,
      powerGrowth: 0.33,
      levels: ["autoClickerLevel", "autoClicker"]
    },
    autoClickerInterval: {
      baseCost: 25,
      costGrowth: 1.2,
      type: "multiply",
      power: 1000,
      powerGrowth: 0.95,
      levels: ["autoClickerIntervalLevel", "autoClickerInterval"]
    },
    autoClickerMultiplier: {
      baseCost: 25,
      costGrowth: 1.2,
      type: "range",
      power: 1,
      powerGrowth: [0.1, 0.2],
      levels: ["autoClickerMultiplierLevel", "autoClickerMultiplier"]
    },
    autoClickerCount: {
      baseCost: 30,
      costGrowth: 1.2,
      type: "plus",
      power: 1,
      powerGrowth: 1,
      levels: ["autoClickerCountLevel", "autoClickerCount"]
    },
    autoClickerBuff: {
      baseCost: 50,
      costGrowth: 1.3,
      type: "toggle",
      power: 0,
      powerGrowth: 0.33,
      levels: ["autoClickerAllowBuff"]
    },
    buffChance: {
      baseCost: 50,
      costGrowth: 1.3,
      type: "plus",
      power: 0,
      powerGrowth: 0.33,
      levels: ["buffChanceLevel", "buffChance"]
    },
    buffPower: {
      baseCost: 20,
      costGrowth: 1.5,
      type: "range",
      power: 2,
      powerGrowth: [0.2, 0.33],
      levels: ["buffPowerLevel", "buffPower"]
    },
    buffMultiplier: {
      baseCost: 40,
      costGrowth: 1.5,
      type: "range",
      power: 1.5,
      powerGrowth: [0.2, 0.33],
      levels: ["buffMultiplierLevel", "buffMultiplier"]
    }
  };


  // --- Game state ---
  let gold = 10000000000000;
  let bulkAmount = 1;
  let clickPacker = 3;
  
  let activeBuffs = [];
  let autoLoop = null;




  document.querySelector(".get_gold").addEventListener("click", ()=>{
    gold = 10000000000000;
    updateGold();
  })
  document.querySelector(".remove_gold").addEventListener("click", ()=>{
    gold = 0;
    updateGold();
  })





  function updateStats() {
    setInterval(()=>{
      document.querySelector(".stats-list").innerHTML = "";
      Object.keys(STATS).forEach(key=>{
        createList(key, STATS[key])
      })
    },333)

    function createList(key, value) {
      let newList = document.createElement("li");
      if (value == null) newList.classList.add("header");
      newList.innerHTML = `${key.replace(/([a-z])([A-Z])/g, '$1 $2')} ${value != null ? ": " + value : null}`;
      document.querySelector(".stats-list").appendChild(newList);
    }
  }
  updateStats()




  // --- Buffs ---
  function activateRandomBuff() {
    const id = `buff-${Date.now()}`;
    const isFlat = Math.random() < 0.5;
  
    if (isFlat) {
      // Flat Buff
      const min = CONFIG.buffStrength.flat.min + CONFIG.buffStrength.flat.scalePerLevel.min * buffStrengthLevel;
      const max = CONFIG.buffStrength.flat.max + CONFIG.buffStrength.flat.scalePerLevel.max * buffStrengthLevel;
      const amount = getRandomIntInRange(min, max);
  
      const duration = getRandomIntInRange(CONFIG.buffStrength.flat.duration.min, CONFIG.buffStrength.flat.duration.max) * 1000;
      const buff = { id, type: 'flat', amount };
  
      activeBuffs.push(buff);
      showBuff(id, `+${amount} Power (${duration / 1000}s)`);
      setTimeout(() => {
        activeBuffs = activeBuffs.filter(b => b.id !== id);
        removeBuff(id);
      }, duration);
  
    } else {
      // Multiplier Buff
      const min = CONFIG.buffStrength.multiplier.min + CONFIG.buffStrength.multiplier.scalePerLevel.min * buffStrengthLevel;
      const max = CONFIG.buffStrength.multiplier.max + CONFIG.buffStrength.multiplier.scalePerLevel.max * buffStrengthLevel;
      const amount = getRandomInRange(min, max).toFixed(2);
  
      const duration = getRandomIntInRange(CONFIG.buffStrength.multiplier.duration.min, CONFIG.buffStrength.multiplier.duration.max) * 1000;
      const buff = { id, type: 'multiplier', amount: parseFloat(amount) };
  
      activeBuffs.push(buff);
      showBuff(id, `×${amount} Multiplier (${duration / 1000}s)`);
      setTimeout(() => {
        activeBuffs = activeBuffs.filter(b => b.id !== id);
        removeBuff(id);
      }, duration);
    }
  }

  function showBuff(id, text) {
    const el = document.createElement('div');
    el.classList.add('buff');
    el.id = id;
    el.textContent = text;
    buffList.appendChild(el);
  }

  function removeBuff(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function updateGold() {
    document.querySelector("#gold").innerHTML = pretty(gold);
  }

  function pretty(num) {
    const numString = `${num}`;
    if (numString.includes(".")) {
      return parseFloat(num.toFixed(2));
    } else {
      return num;
    }
  }

  function random(a = 1, b = 100) {
    const min = Math.ceil(a * 100);
    const max = Math.floor(b * 100);
    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return parseFloat((rand / 100).toFixed(2));
  }

  function autoClickerLoop() {
    if (UPGRADES.autoClicker >  0) {
      console.log("Auto Clicked");
      document.querySelector("click-box").dispatchEvent(new CustomEvent("click", {
        bubbles: true,
        cancelable: true,
        detail: {source: this, clickPower: UPGRADES.autoClicker, clickCount: UPGRADES.autoClickerCount}
      }))
    }
    setTimeout(()=>{
      autoClickerLoop();
    }, UPGRADES[CONFIG.autoClickerInterval.levels[1]])
  }
  autoClickerLoop();



  updateGold();

  
  class TabView extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.init();
    }

    init() {
      const buttons = this.querySelectorAll('.tab-button');
      const contents = this.querySelectorAll('.tab-content');

      // Default: show first tab if none active
      if (!this.querySelector('.tab-button.active') && buttons.length > 0) {
        buttons[0].classList.add('active');
        if (contents[0]) contents[0].classList.remove('hidden');
      }

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const selected = button.dataset.tab;

          // Reset all
          buttons.forEach(btn => btn.classList.remove('active'));
          contents.forEach(content => content.classList.add('hidden'));

          // Activate selected
          button.classList.add('active');
          const target = this.querySelector(`#${selected}`);
          if (target) target.classList.remove('hidden');
        });
      });
    }
  }

  customElements.define('tab-view', TabView);


  class UpgradeButton extends HTMLElement {
    constructor() {
      super();

      this.name = this.getAttribute("data-name");
      this.titleEl = this.querySelector("title");
      this.buttonEl = this.querySelector("button");
      this.costEl = this.buttonEl.querySelector("span");
      this.config = CONFIG[Object.keys(CONFIG).find(key => key == this.name)];
      this.type = this.config.type;
      this.levelEl = this.type != "toggle" ? this.querySelector("level").querySelector("span") : null;
    }

    connectedCallback() {
      this.buttonEl.addEventListener("click", this.upgrade.bind(this));
      this.updateThis();
    }

    upgrade() {
      for (let i = 0; i < bulkAmount; i++) {
        let price = this.getPrice();
        if (gold < price) break;
        
        UPGRADES[this.config.levels[0]] += 1;
        gold -= price;
        
        if (this.type == "plus") {
          UPGRADES[this.config.levels[1]] +=  this.config.powerGrowth;
        } else if (this.type == "multiply") {
          UPGRADES[this.config.levels[1]] = UPGRADES[this.config.levels[1]] * this.config.powerGrowth;
        } else if (this.type == "toggle") {
          UPGRADES[this.config.levels[0]] = 1;
          this.buttonEl.setAttribute("disabled", "disabled");
          this.buttonEl.innerHTML = "Max Level";
          break
        } else if (this.type == "range") {
          UPGRADES[this.config.levels[1]] += random(this.config.powerGrowth[0], this.config.powerGrowth[1]);
        } else {
          console.log("This upgrade type is not available yet");
        }
      }
      console.log(UPGRADES[this.config.levels[0]], UPGRADES[this.config.levels[1]])
      this.updateThis();
      updateGold();
    }

    getPrice(next=false) {
      const level = Math.max(UPGRADES[this.config.levels[0]] - 1, 0);
      const growth = this.config.costGrowth;
      const baseCost = this.config.baseCost;
      return pretty(level * baseCost + baseCost * Math.pow(growth, level));
    }

    updateThis() {
      this.costEl.innerHTML = this.getPrice();
      if (this.levelEl) this.levelEl.innerHTML = UPGRADES[this.config.levels[0]]
    }
  }

  customElements.define("upgrade-button", UpgradeButton);

  class ToggleElement extends HTMLElement {
    constructor() {
      super();

      this.buttons = this.querySelectorAll("button");
    }

    connectedCallback() {
      this.active(0);
      this.buttons.forEach((btn, index)=>{
        btn.addEventListener("click", () => {
          this.active(index);
        })
      })
    }

    active(index) {
      this.querySelector(".active")?.classList.remove("active");
      this.buttons[index].classList.add("active");
      if (this.dataset.controls == "bulkAmount") {
        bulkAmount = parseInt(this.buttons[index].dataset.amount);
      }
    }
  }

  customElements.define("toggle-element", ToggleElement);

  class ClickBox extends HTMLElement {
    constructor() {
      super();

      this.btn = this.querySelector("button") || this;
    }

    connectedCallback() {
      this.btn.addEventListener("click", (e)=>{
        let clickPower = null;
        let clickMultiplier = null;
        let clickCount = null;

        if (e.isTrusted) {
          clickPower = UPGRADES.clickPower;
          clickMultiplier = UPGRADES.clickMultiplier;
          clickCount = UPGRADES.clickCount;
          STATS.playerClicks += 1;
          STATS.playerMined += clickPower * clickMultiplier * clickCount;
        } else {
          clickPower = UPGRADES.autoClicker;
          clickMultiplier = UPGRADES.autoClickerMultiplier;
          clickCount = UPGRADES.autoClickerCount;
          STATS.autoClicks += 1;
          STATS.autoMined += clickPower * clickMultiplier * clickCount;
        }
        this.newGold =  clickPower * clickMultiplier;

        let clickedCount = 0;
        this.clickDelay = 0;
        let clickPack = Math.floor(clickCount / clickPacker);
        this.work(clickCount, clickedCount, clickPack);
      })
    }

    work(clickCount, clickedCount, clickPack) {
      if (clickPack == 0) {
        clickedCount += 1;
        gold += this.newGold;
      } else {
        clickedCount += clickPack;
        gold += this.newGold * clickPack;
      }
      updateGold();
      this.showGold(clickPack);
      this.clickDelay = 75;
      if (clickedCount < clickCount) {
        setTimeout(()=>{
          this.work(clickCount, clickedCount, Math.floor((clickCount - clickedCount) / clickPacker))
        },this.clickDelay)
      } else {
        this.clickDelay = 0;
      }
    }

    showGold(clickPack = null) {
      let newGoldEl = document.createElement("p");
      if (clickPack > 1) {
        newGoldEl.innerHTML = `+ ${pretty(this.newGold)} x${clickPack}`;
      } else {
        newGoldEl.innerHTML = `+ ${pretty(this.newGold)}`;
      }
      newGoldEl.classList.add("new_gold");
      this.appendChild(newGoldEl);
      setTimeout(() => {
        newGoldEl.remove();
      },500);
    }
  }

  customElements.define("click-box", ClickBox);
  
});





