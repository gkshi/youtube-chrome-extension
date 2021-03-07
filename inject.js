const YouTubeHideWatched = {
  delay: 2000,
  mode: null,
  interval: null,
  locationInterval: null,
  lastLocation: null,

  /**
   * "enabled" state
   */
  _enabled: false,
  get enabled () {
    return this._enabled
  },
  set enabled (value) {
    this._enabled = value
    if (value === false) {
      this.destroy()
    } else {
      this.init()
    }
    return value
  },

  /**
   * isReady method
   * @returns {boolean}
   */
  isReady () {
    return this.enabled && window.location.pathname === '/'
  },

  /**
   * Common actions after injection
   */
  async inject () {
    await this.checkStatus()
    await this.init()

    this.locationInterval = setInterval(() => {
      this.checkLocationChanges()
    }, this.delay)
  },

  /**
   * Init method
   * @returns {Promise<void>}
   */
  async init () {
    if (!this.isReady()) {
      return
    }
    console.log('[YouTubeHideWatched] inited')

    await this.checkSettings()
    this.resetDom()
    this.addListeners()
  },

  /**
   * Destroy method
   */
  destroy () {
    this.removeListeners()
  },

  /**
   * Checking enabled status from the browser
   */
  async checkStatus () {
    const getEnabled = new Promise((resolve, reject) => {
      chrome.storage.sync.get(['enabled'], result => {
        if (result.enabled === undefined) {
          result.enabled = true
          chrome.storage.sync.set({enabled: true})
        }
        resolve(result.enabled)
      });
    })
    this.enabled = await getEnabled.then(res => res)
    console.log('[YouTubeHideWatched] checking status, enabled:', this.enabled)
  },

  /**
   * Checking settings from the browser
   */
  async checkSettings () {
    const getMode = new Promise((resolve, reject) => {
      chrome.storage.sync.get(['mode'], result => {
        resolve(result.mode)
      });
    })
    let mode = await getMode.then(res => res)
    if (!mode) {
      await chrome.storage.sync.set({mode: 'opacity'})
      mode = 'opacity'
    }
    this.mode = mode
  },

  /**
   * Adding event listeners and setting intervals
   */
  addListeners () {
    this.interval = setInterval(() => {
      this.searchWatchedVideos()
    }, this.delay)
    document.addEventListener('location-changed', this.onLocationChanged)
  },

  /**
   * Removing event listeners and stopping intervals
   */
  removeListeners () {
    clearInterval(this.interval)
  },

  /**
   * Clearing elements handled before
   */
  resetDom () {
    console.log('[YouTubeHideWatched] resetDom')
    setTimeout(() => {
      const oldWatched = document.querySelectorAll(`.-youtube-hide-watched-mode-${this.mode}`)
      Array.from(oldWatched).forEach(el => {
        el.classList.remove(`-youtube-hide-watched-mode-${this.mode}`)
      })
    }, 0)
  },

  /**
   * Searching watched videos on the page
   */
  searchWatchedVideos () {
    console.log('[YouTubeHideWatched] searchWatchedVideos')
    const progressBars = document.querySelectorAll('#progress')
    if (!progressBars.length) {
      return
    }
    Array.from(progressBars).forEach(i => {
      if (i.style.width === '100%') {
        const parent = i.closest('ytd-rich-item-renderer')
        parent.classList.add(`-youtube-hide-watched-mode-${this.mode}`)
      }
    })
  },

  /**
   * Checking when url changes
   */
  checkLocationChanges () {
    if (window.location.pathname !== this.lastLocation) {
      this.emit({
        from: this.lastLocation,
        to: window.location.pathname
      })
      this.lastLocation = window.location.pathname
    }
  },

  /**
   * Emitting custom events
   * @param payload
   */
  emit (payload = {}) {
    console.log('[YouTubeHideWatched] emitting now', payload)
    document.dispatchEvent(new CustomEvent('location-changed', {
      detail: payload
    }))
  },

  /**
   * Location changes handler
   */
  onLocationChanged (e) {
    console.log('[YouTubeHideWatched] onLocationChanged', e.detail)
    if (e.detail.to !== '/') {
      YouTubeHideWatched.destroy()
    } else {
      YouTubeHideWatched.init()
    }
  }
}

/**
 * Main init
 */
YouTubeHideWatched.inject()

/**
 * Cleaning before window unload
 */
window.addEventListener('beforeunload', function(e){
  clearInterval(YouTubeHideWatched.locationInterval)
}, false);
