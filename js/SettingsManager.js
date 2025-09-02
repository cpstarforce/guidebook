Guidebook.SettingsManager = class {

  constructor(options = {}) {
    this.init(options);
    return this;
  }

  get savedSettings() {
    return localStorage["Settings"];
  }

  set savedSettings(object) {
    localStorage["Settings"] = JSON.stringify(object);
  }

  async init(options = {}) {
    this.client = options.client;
    this.defaults = options.settings;
    this.settings = {};

    this.client.components.navigator.settingsLauncher.addEventListener("click", () => {
      this.panel.launch();
    });

    if (typeof this.savedSettings == "string") {
      this.load();
    } else {
      this.register();
    }
  }

  async register() {
    this.settings = this.defaults;
    this.save();
  }

  async reset(key) {
    this.update(key, "default");
  }

  async resetAll() {
    for (let key in this.settings) {
      this.reset(key);
    }
  }

  async save() {
    this.savedSettings = this.settings;
  }

  async update(key, value) {
    this.settings[key].value = value;
    this.save();
    this.applyAll();
  }

  async load() {
    this.settings = JSON.parse(this.savedSettings);
    await this.filter();
    await this.checkForUpdates();
  }

  async filter() {
    for (let key in this.settings) {
      if (!this.defaults[key]) {
        delete this.settings[key];
      }
    }
    this.save();
  }

  async checkForUpdates() {
    for (let key in this.defaults) {
      if (!this.settings[key]) {
        this.settings[key] = this.defaults[key];
      }
    }
    for (let key in this.settings) {
      if (this.settings[key].defaultValue != this.defaults[key].defaultValue) {
        this.settings[key].defaultValue = this.defaults[key].defaultValue;
      }
    }
    this.save();
  }

  async applyAll() {
    for (let key in this.settings) {
      const setInputValue = (useDefault) => {
        let value;
        if (document.querySelector(`#setting-${key}`)) {
          if (useDefault) value = this.settings[key].defaultValue;
          else value = this.settings[key].value;

          if (typeof value == "boolean") document.querySelector(`#setting-${key}`).checked = value;
          else document.querySelector(`#setting-${key}`).value = value;
        }
      }

      if (this.settings[key].value == "default") {
        this.apply[key](this.settings[key].defaultValue);
        setInputValue(true);
      } else {
        this.apply[key](this.settings[key].value);
        setInputValue(false);
      }
    }
  }

  get(key) {
    return (this.settings[key].value == "default") ? this.settings[key].defaultValue : this.settings[key].value;
  }

  apply = {

    animations: (value) => {
      document.body.classList.toggle("no-animations", !value);
    },
    blurEffects: (value) => {
      document.body.classList.toggle("no-blur-effects", !value);
    },
    preloader: (value) => {
      if (value) this.client.preload.articles(this.client.articles);
      else this.client.preload.eraseAll();
    },
    autoCloseDefinitionInfoboxes: (value) => {
      return;
    },
    showDiscordWidget: (value) => {
      if (value && this.client.discordWidget) this.client.discordWidget.show();
      else if (!value && this.client.discordWidget) this.client.discordWidget.hide();
    },
    discordWidgetColor: (value) => {
      if (this.client.discordWidget) this.client.discordWidget.options.color = value;
    }

  }

  panel = {

    launch: () => {
      const getInputAttributesFor = (key) => {
        return (
          `
            type="checkbox"
            id="setting-${key}"
            oninput="client.settings.update('${key}', this.checked)"
            ${(this.get(key)) ? "checked" : ""}
        `);
      }
      const getColorAttributesFor = (key) => {
        return (
          `
            type="color"
            id="setting-${key}"
            oninput="client.settings.update('${key}', this.value)"
            value="${this.get(key)}"
        `);
      }

      this.client.modals.create({
        id: "Settings",
        title: "Settings",
        content: (`
          <p>You can customize your settings here. All changes are autoconfirmed and automatically saved to your device.</p>
          <br>

          <input ${getInputAttributesFor("animations")}>
          <label for="animations">Animations</label>
          <br>
          <small>Controls whether animations are played or not. This does not affect petty transitions.</small>

          <br>
          <br>
          <input ${getInputAttributesFor("blurEffects")}>
          <label for="blurEffects">Blur effects</label>
          <br>
          <small>Choose whether blur effects are visible or not. Disable if you are experiencing lag in popups.</small>

          <br>
          <br>
          <input ${getInputAttributesFor("preloader")}>
          <label for="preloader">Preloader</label>
          <br>
          <small>Toggle the preloader, which preloads all articles upon loading to significantly increase browsing speed.</small>

          <br>
          <br>
          <input ${getInputAttributesFor("autoCloseDefinitionInfoboxes")}>
          <label for="preloader">Automatically close definition infoboxes</label>
          <br>
          <small>Choose whether definition infoboxes should be closed automatically after a fixed amount of time (10 seconds).</small>

          <br>
          <br>
          <input ${getColorAttributesFor("discordWidgetColor")}>
          <label for="discordWidgetColor">Discord widget color</label>
          <br>
          <small>Select the color of the Discord widget icon visible on the bottom right corner.</small>

          <br>
          <br>
          <input ${getInputAttributesFor("showDiscordWidget")}>
          <label for="showDiscordWidget">Show Discord widget</label>
          <br>
          <small>Decide whether the Discord widget icon on the bottom right corner is visible.</small>

          <br>
          <br>
          <button onclick="client.settings.resetAll()">Reset to defaults</button>
        `),
        unboxed: false,
        exitable: true,
        hr: false
      })
    }

  }

}