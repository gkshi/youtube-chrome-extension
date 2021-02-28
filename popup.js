const Popup = {
  mode: null,
  enabled: false,

  elements: {},

  async init () {
    console.log('[init]')
    this.checkEnabled()
    this.addElements()
    this.getMode()
  },

  checkEnabled () {
    chrome.storage.sync.get(['enabled'], result => {
      console.log('[get enabled]', result.enabled)
      if (result.enabled === undefined) {
        result.enabled = true
        chrome.storage.sync.set({ enabled: true })
      }
      this.enabled = result.enabled
      this.elements.enabled.checked = this.enabled
    });
  },

  setEnabled (value) {
    console.log('[set enabled]', value)
    chrome.storage.sync.set({ enabled: value })
    this.enabled = value
  },

  getMode () {
    chrome.storage.sync.get(['mode'], result => {
      this.mode = result.mode
      console.log('[get mode]', this.mode)
      this.toggleMode(this.mode)
    });
  },

  setMode (mode) {
    chrome.storage.sync.set({ mode })
    this.mode = mode
    console.log('[set mode]', mode)
  },

  toggleMode (mode) {
    if (!mode) {
      return
    }
    console.log('[toggle mode]', mode)
    mode === 'hide' ? this.elements.modeHide.checked = true : this.elements.modeOpacity.checked = true
  },

  addElements () {
    this.elements = {
      modeOpacity: document.querySelector('input[name="mode"][value="opacity"]'),
      modeHide: document.querySelector('input[name="mode"][value="hide"]'),
      enabled: document.querySelector('input[name="enabled"]')
    }
    console.log('[add elements]', this.elements)

    this.elements.modeOpacity.addEventListener('change', e => {
      // console.log('change', e.target.checked)
      this.setMode('opacity')
    })
    this.elements.modeHide.addEventListener('change', e => {
      // console.log('change', e.target.checked)
      this.setMode('hide')
    })
    this.elements.enabled.addEventListener('change', e => {
      this.setEnabled(e.target.checked)
    })
  }
}

// document.addEventListener("DOMContentLoaded", Popup.init())
Popup.init()

// Initialize butotn with users's prefered color
// let changeColor = document.getElementById("changeColor");

// When the button is clicked, inject setPageBackgroundColor into current page
// changeColor.addEventListener("click", async () => {
//   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: setPageBackgroundColor,
//   });
// });

// The body of this function will be execuetd as a content script inside the
// current page
// function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
//   });
// }
