Guidebook.Client = class {

  constructor(options = {}) {
    this.init(options);
    return this;
  }

  get savedPassword() {
    return ;
  }

  async init(options = {}) {

    this.viewing = null;
    this.settings = {};

    this.config = await this.contentReader(options.config);
    this.definitions = await this.contentReader(options.definitions);
    this.components = await this.contentReader(options.components);
    this.index = await this.contentReader(options.index);

    this.entrypoint = await this.config.entrypoint;
    this.articleDirectory = await this.config.articleDirectory;
    this.mediaDirectory = await this.config.mediaDirectory;

    this.config.lastUpdated = new Date(this.config.lastUpdated);
    this.config.lastUpdated.luxon = function() {
      return luxon.DateTime.fromISO(this.toISOString()).toFormat(client.config.longDateFormat);
    }

    this.modals = new Guidebook.ModalsManager({
      client: this
    });

    this.settings = new Guidebook.SettingsManager({
      client: this,
      settings: await this.contentReader(options.settings)
    });

    this.settings.applyAll();
    this.load.navigator();

    if (this.config.passwordProtected) {
      if (localStorage["Password"]) autologin(localStorage["Password"]);
      else this.login.request();
    }

    if (this.config.WidgetBot.available && this.settings.get("showDiscordWidget")) {
      this.discordWidget = new Crate({
        server: this.config.WidgetBot.guildID,
        channel: this.config.WidgetBot.channelID,
        color: this.settings.get("discordWidgetColor")
      });
      this.discordWidget.on('sentMessage', (data) => {
        this.modals.create({
          id: "messageBlocked",
          content: `
            Sorry! You can't send messages through the widget in the guidebook.
            <small>Click anywhere on the screen to close this warning.</small>
          `,
          unboxed: true,
          exitable: true,
          preventSelection: true
        })
      })
    } else {
      this.discordWidget = null;
    }

  }

  login = {

    request: async () => {
      this.modals.create({
        id: "login",
        title: "Authorization",
        content: (
          `
            <img src="${this.mediaDirectory}/logo.png"></img>
            <br>
            <h2>${this.config.name}</h2>
            <p>Welcome to the official guidebook for <b>${this.config.armyName}</b>…</p>
            <br>
            <input placeholder="Password…" oninput="loginPasswordInput(this.value)"></input>
            <br>
            <small id="login-error" style="color: #FF7E73;"></small>
          `
        ),
        unboxed: true,
        exitable: false
      });
    },

    finish: async () => {
      this.modals.close("login");
      document.querySelector("b#title").textContent = this.config.name;
      this.toggleWrapper(false);
      this.scanURL();
    }

  }

  query = {

    create: (path) => {
      const dir = this.articleDirectory.replace(/^\.?\//, "").replace(/\/$/, "");
      const regex = new RegExp(`^(\\.\\/)?(${dir}\\/)|^\\/(${dir}\\/)?`);
      return path.replace(regex, "").replace(/\.html$/, "");
    }

  }

  async scanURL() {
    const hash = location.hash.replace("#", "");
    if (hash.length > 0) {
      if (this.index[`${hash}.html`]) this.load.article(hash);
      else this.load.article("errors/404");
    } else {
      this.load.article(this.entrypoint);
    }
  }

  load = {

    navigator: async () => {
      for (const key in this.index) {
        const article = this.index[key];
        if (!article.listed) continue;
        const link = document.createElement("a");
        link.classList.add("articleLink");
        if (article.nested) link.classList.add("nested");
        link.href = `#${this.query.create(key)}`;
        link.textContent = article.name;
        link.setAttribute("name", key);
        link.onclick = async () => {
          this.load.article(key);
        };
        this.components.navigator.content.appendChild(link);
      }
      return;
    },

    article: async (path) => {
      path = this.query.create(path).replace("#", "");
      if (this.viewing == path) return;
      let articleData = this.index[path];
      if (articleData == undefined) {
        articleData = {
          path: path,
          name: "Unknown Article",
          nested: false,
          listed: false
        };
      }
      if (!this.preload.list.hasOwnProperty(path)) {
        let content;
        try {
          content = await this.readFile(`${this.articleDirectory}/${path}.html`);
        } catch(error) {
          console.error(error);
          this.load.article(`errors/404.html`);
          return;
        }
        this.components.reader.innerHTML = content;
        this.preload.article(path);
      } else {
        this.components.reader.innerHTML = this.preload.list[path];
      }
      if (this.components.reader.innerHTML.includes("<!-- page:centered -->")) {
        this.components.reader.classList.add("centered");
      } else {
        this.components.reader.classList.remove("centered");
      }
      this.components.reader.innerHTML = Guidebook.readVariables(this.components.reader.innerHTML, {
        article: articleData
      });
      document.querySelector(`aside a.articleLink[name="${this.viewing}"]`)?.classList.remove("viewing");
      this.viewing = path;
      document.querySelector(`aside a.articleLink[name="${path}"]`)?.classList.add("viewing");
      this.render.definitions();
      this.render.images();
      this.render.links();
      this.render.mentions();
    }

  }

  async define(identifier) {
    const {
      thumbnail,
      definition
    } = this.definitions[identifier];

    const cleanIdentifier = identifier.split("[")[0];

    this.infobox.open({
      content: (
        `
          <img src="${thumbnail || `${this.mediaDirectory}/default-definition-thumbnail.png`}"></img>
          <p><b>${cleanIdentifier}</b><br>${definition}</p>
        `
      ),
      type: 'definition',
      autoClose: (this.settings.get("autoCloseDefinitionInfoboxes")) ? 10000 : null
    });
  }

  render = {

    definitions: async () => {
      document.querySelectorAll("main dfn").forEach((definition) => {
        definition.addEventListener("click", () => {
          this.define(definition.getAttribute("name"))
        });
      })
    },

    images: async () => {
      document.querySelectorAll("main img").forEach((image) => {
        const src = image.getAttribute("src");
        image.onclick = () => {
          this.modals.create({
            id: "imageViewer",
            title: image.getAttribute("name") || "Image",
            content: (
              `
                <img src="${src}"></img>
                <small style="margin-top: 10px;"><a href="${src}" target="_blank">Open in browser</a></small>
              `
            ),
            unboxed: true,
            exitable: true,
            preventSelection: true
          });
        }
      });
    },

    links: async () => {
      document.querySelectorAll("main a").forEach((link) => {
        const target = link.getAttribute("target");
        if (!target) {
          link.setAttribute("target", "_blank");
        }
        if (link.href.startsWith("#")) {
          link.onclick = () => {
            this.load.article(link.href)
          }
        }
      });
    },

    mentions: async () => {
      document.querySelectorAll("main span.discord-channel").forEach((mention) => {
        const channelId = mention.getAttribute("channelId");
        if (channelId) {
          mention.onclick = () => {
            this.discordWidget.navigate(channelId);
          }
        }
        mention.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path></svg>${mention.innerHTML}`;
      });
      document.querySelectorAll("main span.discord-voice-channel").forEach((mention) => {
        const channelId = mention.getAttribute("channelId");
        if (channelId) {
          mention.onclick = () => {
            this.discordWidget.navigate(channelId);
          }
        }
      });
      document.querySelectorAll("main span.discord-stage-channel").forEach((mention) => {
        const channelId = mention.getAttribute("channelId");
        if (channelId) {
          mention.onclick = () => {
            this.discordWidget.navigate(channelId);
          }
        }
        mention.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19.61 18.25a1.08 1.08 0 0 1-.07-1.33 9 9 0 1 0-15.07 0c.26.42.25.97-.08 1.33l-.02.02c-.41.44-1.12.43-1.46-.07a11 11 0 1 1 18.17 0c-.33.5-1.04.51-1.45.07l-.02-.02Z" class=""></path><path fill="currentColor" d="M16.83 15.23c.43.47 1.18.42 1.45-.14a7 7 0 1 0-12.57 0c.28.56 1.03.6 1.46.14l.05-.06c.3-.33.35-.81.17-1.23A4.98 4.98 0 0 1 12 7a5 5 0 0 1 4.6 6.94c-.17.42-.13.9.18 1.23l.05.06Z" class=""></path><path fill="currentColor" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.33 20.03c-.25.72.12 1.5.8 1.84a10.96 10.96 0 0 0 9.73 0 1.52 1.52 0 0 0 .8-1.84 6 6 0 0 0-11.33 0Z" class=""></path></svg>${mention.innerHTML}`;
      });
      document.querySelectorAll("main span.discord-role").forEach((mention) => {
        const color = mention.getAttribute("color");
        if (color) {
          mention.style.color = color;
          mention.style.background = `${color}20`;
          mention.setAttribute("onmouseover", `this.style.background = "${color}40"`);
          mention.setAttribute("onmouseout", `this.style.background = "${color}20"`);
        }
        mention.innerHTML = `@${mention.innerHTML}`;
      });
      document.querySelectorAll("main span.slash-command").forEach((mention) => {
        const command = `/${mention.innerHTML}`;
        mention.onclick = () => {
          navigator.clipboard.writeText(command);
        }
      });
    }
  }

  preload = {

    list: {},

    article: async (path) => {
      if (!this.settings.get("preloader")) return;
      this.preload.list[path] = await this.readFile(`${this.articleDirectory}/${path}`);
    },

    articles: async (articles) => {
      if (!this.settings.get("preloader")) return;
      if (typeof articles == "object") {
        for (const key in articles) {
          articles[key] = await this.preload.article(key);
        }
      } else if (typeof articles == "array") {
        articles.forEach(async article => {
          await this.preload.article(article);
        });
      }
    },

    eraseAll: async () => {
      this.preload.list = {};
    }

  }

  infobox = {

    open: async function(options) {

      const infobox = document.querySelector("div#infobox");
      infobox.classList.add("show");
      infobox.classList.add("prevent-selection");
      infobox.classList.add(options.type || "info");
      infobox.classList.add(options.position || "bottom-right");
      infobox.innerHTML = options.content || "Nothing to see here!";

      const closeInfobox = () => this.close();

      infobox.addEventListener("click", closeInfobox);

      if (options.color) infobox.style.borderLeftColor = options.color;

      if (this.autoCloseTimeout) clearTimeout(this.autoCloseTimeout), delete options.autoCloseTimeout;

      if (options.autoClose) this.autoCloseTimeout = setTimeout(() => {
        closeInfobox();
      }, options.autoClose);
    },

    close: async function() {
      const infobox = document.querySelector("div#infobox");
      infobox.classList.remove("show");
      infobox.classList.add("hide");
      clearTimeout(this.autoCloseTimeout);
      delete this.autoCloseTimeout;
    }

  }

  async contentReader(src) {
    if (typeof src == "object") {
      return src;
    } else if (typeof src == "function") {
      return src();
    }
    return await this.readFile(src);
  }

  async readFile(file) {
    let content;
    await fetch(file).then(async (response) => {
      if (response.status === 404) {
        throw new Error(`File not found: "${file}" (${response.status})`)
      } else if (response.status !== 200) {
        throw new Error(`Failed to load file: "${file}" (${response.status})`);
      }
      content = await response.text();
    });
    if (file.endsWith(".json")) {
      content = JSON.parse(content);
    }
    return content;
  }

  async toggleWrapper(toggle, exitable) {
    const wrapper = this.components.wrapper;
    if (toggle == true) wrapper.style.display = "flex";
    else if (toggle == false) wrapper.style.display = "none";
    else wrapper.style.display = (getComputedStyle(wrapper).display == "flex") ? "none" : "flex";

    if (exitable == false) wrapper.onclick = () => {  return null  };
    else wrapper.onclick = () => {  this.modals.closeLast()  };
  }

}