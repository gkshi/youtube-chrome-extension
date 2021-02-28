console.log('[inject]')

const MyInject = {
    interval: null,
    mode: null,
    enabled: false,

    async init () {
        console.log('[init]')

        await this.checkEnabled()
        if (this.enabled) {
            const path = document.location.pathname
            console.log('path', path)
            await this.checkSettings()
            this.addListeners()
        }
    },

    async checkEnabled () {
        const getEnabled = new Promise((resolve, reject) => {
            chrome.storage.sync.get(['enabled'], result => {
                if (result.enabled === undefined) {
                    result.enabled = true
                    chrome.storage.sync.set({ enabled: true })
                }
                resolve(result.enabled)
            });
        })
        this.enabled = await getEnabled.then(res => res)
        console.log('[check enabled]', this.enabled)
    },

    async checkSettings () {
        const getMode = new Promise((resolve, reject) => {
            chrome.storage.sync.get(['mode'], result => {
                resolve(result.mode)
            });
        })
        let mode = await getMode.then(res => res)
        if (!mode) {
            await chrome.storage.sync.set({ mode: 'opacity' })
            mode = 'opacity'
        }
        this.mode = mode
        console.log('[checkSettings]', mode)
    },

    addListeners () {
        this.interval = setInterval(this.checkProgressBars, 2000)
    },

    removeListeners () {
        clearInterval(this.interval)
    },

    checkProgressBars () {
        const progressBars = document.querySelectorAll('#progress')
        if (!progressBars.length) {
            return
        }
        Array.from(progressBars).forEach(i => {
            if (i.style.width === '100%') {
                const parent = i.closest('ytd-rich-item-renderer')
                switch (MyInject.mode) {
                    case 'opacity':
                        parent.style.opacity = '.15'
                        // parent.style.pointerEvents = 'none'
                        break
                    case 'hide':
                        parent.style.display = 'none'
                        break
                }
            }
        })
    }
}

// document.addEventListener("DOMContentLoaded", MyInject.checkEnabled)
MyInject.init()
