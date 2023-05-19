if (AHelper === undefined) var AHelper = {};
AHelper.name = 'Ascension Helper';
AHelper.version = '1.0';
AHelper.GameVersion = '2.043';

AHelper.launch = function() {
  AHelper.init = function() {
    var config = AHelper.config;
    AHelper.config = {
      autoClickBig: 0,
      autoClickGold: 0,
      autoBuyBuildings: 0,
      autoAscend: 0,
      clickWrath: 0,
    };
    AHelper.CustomGameMenu();
    AHelper.iconURL = AHelper.GetModPath('AHelper') + '/AHelpericon.png'
    Game.Notify('<div align="center">AHelper Initialised</div>', '<div style="text-align: center;font-weight: bold;color: #f2ff5c;">Have Fun Ascending!</div>', [0, 0, AHelper.iconURL], 6, 1);
  }

  AHelper.GetModPath = (modName) => {
    let mod = App.mods[modName];
    let pos = mod.dir.lastIndexOf('\\');
    if(pos == -1) return '../mods/' + (mod.local ? 'local' : 'workshop') + '/' + mod.path;
    else return '../mods/' + mod.dir.substring(pos + 1);
  }

  var autoClickerGold;
  var autoClickerBig;
  var autoBuyBuildingsf;
  var autoAscendf;

  AHelper.CustomGameMenu = function() {
    Game.customOptionsMenu.push(function() {
      CCSE.AppendCollapsibleOptionsMenu(AHelper.name, AHelper.getMenuStuff());
    });
    Game.customStatsMenu.push(function() {
      CCSE.AppendStatsVersionNumber(AHelper.name, AHelper.version);
    });
  }


  AHelper.getMenuStuff = function() {
    menuString = '<div class="listing">' + CCSE.MenuHelper.ToggleButton(AHelper.config, 'autoClickBig', 'AHelper_autoClickBigButton', 'Auto-Click Main ON', 'Auto-Click Main OFF', "AHelper.Clicked") + '<label>Turns on an auto-clicker for the big cookie</label>' + '<br>'; 
    menuString +=  CCSE.MenuHelper.ToggleButton(AHelper.config, 'autoClickGold', 'AHelper_autoClickGoldButton', 'Auto-Click Gold ON', 'Auto-Click Gold OFF', "AHelper.Clicked") + '<label>Automatically clicks on golden cookies (And reindeers) when they appear (Unless a Cookie Storm is in progress).</label> | ' + CCSE.MenuHelper.ToggleButton(AHelper.config, 'clickWrath', 'AHelper_autoClickWrathButton', 'Click Wrath ON', 'Click Wrath OFF', "AHelper.Clicked") + '<label>When ON, mod will click Wrath cookies, when OFF, mod will not click Wrath cookies.</label> <br>';
    menuString +=  CCSE.MenuHelper.ToggleButton(AHelper.config, 'autoBuyBuildings', 'AHelper_autoBuyBuildings', 'Auto-Buy Builds ON', 'Auto-Buy Builds OFF', "AHelper.Clicked") + '<label>Automatically buys Buildings and Upgrades (Not a smart script, just buys any avaliable)</label>' + '<br>';
    menuString +=  CCSE.MenuHelper.ToggleButton(AHelper.config, 'autoAscend', 'AHelper_autoAscend', 'Auto-Ascend ON', 'Auto-Ascend OFF', "AHelper.Clicked") + '<label>Automatically Ascends (Use with \'Auto-Buy Builds\', \'Auto-Click Main\', and \'Auto-Click Gold\' to automate the 1000 Ascends achievement)</label>' + '<br>' + '</div>';
    return menuString
  }

  AHelper.Clicked = function(prefName, button, on, off, invert) {
    if (AHelper.config[prefName]) {
      l(button).innerHTML = off;
      AHelper.config[prefName] = 0;
    } else {
      l(button).innerHTML = on;
      AHelper.config[prefName] = 1;
    }
    l(button).className = 'option' + ((AHelper.config[prefName] ^ invert) ? '' : ' off');

    if (prefName == 'autoClickBig') {
      AHelper.AutoClickBigf();
    } else if (prefName == 'autoClickGold') {
      AHelper.AutoClickGoldf();
    } else if (prefName == 'autoBuyBuildings') {
      AHelper.AutoBuyBuildings();
    } else if (prefName == 'autoAscend') {
      AHelper.AutoAscend();
    }
  }

  ////***************////
  ////*FUNCTIONALITY*////
  ////***************////

  AHelper.AutoClickBigf = function() {
    if (AHelper.config.autoClickBig == 1) {
      autoClickerBig = setInterval(function() {
        Game.ClickCookie("", Game.mouseCps());
      }, 1);
      Game.Notify('Auto Click Big On', '', '', 1, 1);
    } else {
      clearInterval(autoClickerBig);
      Game.Notify('Auto Click Big Off', '', '', 1, 1);
    }
  }

  AHelper.AutoClickGoldf = function() {
    if (AHelper.config.autoClickGold == 1) {
      autoClickerGold = setInterval(function() {
        if (!Game.hasBuff('Cookie storm')) {
          if (AHelper.config.clickWrath)
            Game.shimmers.forEach(function(shimmer) {
              shimmer.pop();
            });
          else {
            Game.shimmers.forEach(function(shimmer) {
              if(shimmer.type == "golden" && shimmer.wrath == 0) {
                shimmer.pop();
              }
            });
          }
        }
        if (Game.seasonPopup.life > 0) { 
          Game.seasonPopup.click();
        }
      }, 500);
      Game.Notify('Auto Click Gold On', '', '', 1, 1)
    } else {
      clearInterval(autoClickerGold);
      Game.Notify('Auto Click Gold Off', '', '', 1, 1)
    }
  }

  AHelper.AutoBuyBuildings = function() {
    if (AHelper.config.autoBuyBuildings == 1) {
      autoBuyBuildingsf = setInterval(function() {
        for (var j in Game.UpgradesInStore) {
          var mei = Game.UpgradesInStore[j];
          if (!mei.isVaulted() && mei.pool!='toggle' && mei.pool!='tech') mei.buy(1);
        }
        if (Game.buyMode == 1) {
          for (var i in Game.Objects) {
            var me = Game.Objects[i];
            Game.ObjectsById[me.id].buy(100);
          }
        }
      }, 50);
      Game.Notify('Auto Buy Buildings On', '', '', 1, 1)
    } else {
      clearInterval(autoBuyBuildingsf);
      Game.Notify('Auto Buy Buildings Off', '', '', 1, 1)
    }
  }

  var ascendTime = 0;
  var timeSinceAscent = 0;
  AHelper.AutoAscend = function() {
    if (AHelper.config.autoAscend == 1) {
      autoAscendf = setInterval(function() {
        timeSinceAscent = Date.now() - ascendTime;
        if (Game.ascendMeterLevel > 0 && timeSinceAscent >= 20000) {
          Game.Ascend(true);
          setTimeout(function() {Game.Reincarnate(true);}, 6000);
          ascendTime = Date.now();
        }
      }, 1000);
      Game.Notify('Auto Ascend On', '', '', 1, 1)
    } else {
      clearInterval(autoAscendf);
      Game.Notify('Auto Ascend Off', '', '', 1, 1)
    }
  }

  if (CCSE.ConfirmGameVersion(AHelper.name, AHelper.version, AHelper.GameVersion)) Game.registerMod(AHelper.name, AHelper);
}


if (!AHelper.isLoaded) {
  if (CCSE && CCSE.isLoaded) {
    AHelper.launch();
  } else {
    if (!CCSE) var CCSE = {};
    if (!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
    CCSE.postLoadHooks.push(AHelper.launch);
  }
}