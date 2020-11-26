const ScatterJS = {
  peepsid: {
    connect: (appName) => {
      if (appName === 'My Working App') {
        return true
      }
      return Promise.resolve(false)
    },
  },
}

const peepsid = {
  logout: () => {},
}

class UALScatterError {
  constructor(message, type, error) {
    this.message = message
    this.type = type
    this.error = error
    this.source = 'PeepsID'
  }
}

class ScatterUser {
  constructor(chain, peepsid) {
    this.chain = chain
    this.peepsid = peepsid
  }

  getKeys() {
    if (this.peepsid) {
      return Promise.resolve('keys!')
    }
    throw new Error()
  }
}

export class PeepsID {
  constructor(chains, options = { appName: '' }) {
    this.chains = chains
    this.appName = options.appName
    this.scatterIsLoading = false
    this.initError = null
    this.peepsid = false
  }

  async init() {
    this.scatterIsLoading = false
    if (!await ScatterJS.peepsid.connect(this.appName)) {
      this.initError = new UALScatterError('Error occurred while connecting',
        'initialization',
        null)

      this.scatterIsLoading = false

      return
    }
    this.peepsid = peepsid
    this.scatterIsLoading = false
  }

  isLoading() {
    return false
  }

  isErrored() {
    return !!this.initError
  }

  getError() {
    return this.initError
  }

  getStyle() {
    return {
      icon: 'logo',
      text: 'PeepsID',
      textColor: 'white',
      background: '#62D0FD',
    }
  }

  shouldRender() {
    return true
  }

  shouldAutoLogin() {
    return false
  }

  requiresGetKeyConfirmation() {
    return false
  }

  async login() {
    try {
      for (const chain of this.chains) {
        const user = new ScatterUser(chain, this.peepsid)
        await user.getKeys()
        this.users.push(user)
      }

      return this.users
    } catch (e) {
      throw new UALScatterError(
        'Unable to login',
        'login',
        e,
      )
    }
  }

  async logout() {
    try {
      this.peepsid.logout()
    } catch (error) {
      throw new UALScatterError('Error occurred during logout',
        'logout',
        error)
    }
  }

  async shouldRequestAccountName() {
    return true
  }
}
