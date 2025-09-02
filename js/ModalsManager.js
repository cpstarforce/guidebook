Guidebook.ModalsManager = class {

  constructor(options = {}) {
    this.init(options);
    return this;
  }

  get ModalHTMLElementCreator() {
    let element = document.createElement("div");
    element.classList.add("modal");
    return element;
  }

  async init(options) {
    this.client = options.client;
    this.modals = [];
  }

  async create(options) {

    const modal = this.ModalHTMLElementCreator;
    modal.id = `modal-${options.id}`;

    modal.innerHTML = (
      `
        ${options.title ? "<span class='title'>" + options.title + "</span>" : ""}
        ${options.hr ? "<hr>" : ""}
      `
    );

    modal.innerHTML += (
      `
        ${options.content || "Nothing to see here!"}
      `
    );

    if (!options.unboxed) modal.classList.add("not-unboxed");
    else modal.classList.add("unboxed");

    if (options.unboxed) modal.style.background = "#00000000";

    if (options.unboxed) this.client.components.wrapper.appendChild(modal);
    else document.body.appendChild(modal);

    if (options.preventSelection) modal.classList.add("prevent-selection");

    this.client.toggleWrapper(true, options.exitable);
    this.modals.push(modal);

    return modal;

  }

  async close(id) {
    this.modals.find(modal => modal.id == `modal-${id}`)?.remove();
    this.modals = this.modals.filter(modal => modal.id != `modal-${id}`);
    if (this.modals.length == 0) this.client.toggleWrapper(false);
  }

  async closeLast() {
    this.modals[this.modals.length - 1].remove();
    this.modals.pop();
    if (this.modals.length == 0) this.client.toggleWrapper(false);
  }

}