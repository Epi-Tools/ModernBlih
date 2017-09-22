const root = document.getElementById('app')

const wesh = console.log

const opts = {
  lines: 13,
  length: 28,
  width: 14,
  radius: 31,
  scale: 1,
  corners: 1,
  color: '#000',
  opacity: 0.25,
  rotate: 0,
  direction: 1,
  speed: 1,
  trail: 60,
  fps: 20,
  zIndex: 2e9,
  className: 'spinner',
  top: '50%',
  left: '50%',
  shadow: false,
  hwaccel: false,
  position: 'absolute'  
}

const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

mx.storage(mx.DEFAULT_STORAGE_NAME, mx.SESSION_STORAGE)

const storage = mx.storage()

const stateChange = {
  state: {
    username: {
      value: ''
    },
    token: {
      value: ''
    },
    login: {
      value: false
    },
    repoList: {
      value: {}
    },
    showLoginModal: {
      value: false
    }
  },
  history: [],
  stateMutate(name, props) {
    if (!this.state[name]) return
    props = { value: props }
    this.history.push({ action: name, value: props, old: Object.assign({}, this.state) })
    this.state[name] = Object.assign(this.state[name], props)
  }
}

const closeModal = () => {
  stateChange.stateMutate('showLoginModal', false)
  m.redraw()
}

const pwdValid = data => data.pwd.length >= 8 ? { value: true, ...data } : { value: false, error: 'Password must be at least 8 characters', ...data }

const emailValid = data => emailReg.test(data.email) ? { value: true, ...data } : { value: false, error: 'Wrong Email', ...data }

const validateLogin = R.compose(emailValid, pwdValid)

const getId = id => document.getElementById(id)

const newSpin = id => new Spinner(opts).spin(id)

const spin = R.compose(newSpin, getId)

const stop = spin => spin.stop()

const setStorage = (key, props) => new Promise(s => s(storage.set('state', props)))

const login = ctx => {
  const logSpin = spin('loginSpin')
  ctx.showLoginButton = false
  return axios.post('/api/auth', { email: ctx.email, pwd: ctx.pwd }).then(({ data }) => {
    stateChange.stateMutate('username', ctx.email)
    stateChange.stateMutate('login', true)
    stateChange.stateMutate('token', data.token)
    stateChange.stateMutate('repoList', data.body.repositories)
    return setStorage('state', stateChange.state).then(() => {
      stop(logSpin)
      ctx.showLoginButton = true
      m.redraw()
    })
  }).catch(err => {
    wesh(err)
    ctx.errorValidation = 'Wrong Auth Info'
    stop(logSpin)
    ctx.showLoginButton = true
    m.redraw()
  })
}

const submitLogin = ctx => {
  const valid = validateLogin(ctx)
  if (valid.error) {
    ctx.errorValidation = valid.error
    return
  }
  ctx.errorValidation = null
  login(ctx)
}

const LoginForm = {
  oninit() {
    this.errorValidation = null
    this.pwd = null
    this.email = null
    this.showLoginButton = true
  },
  view() {
    return m('div', [
      m('label.label', { for: 'login' }, 'Login'),
      m('input.input[type=email][placeholder=Login]', { id: 'login', name: 'login', required: 'required',
        onchange: e => this.email = e.target.value }),
      m('label.label', 'Password'),
      m('input.input[placeholder=Password][type=password]', { id: 'password', name: 'password', required: 'required',
        onchange: e => this.pwd = e.target.value }),
      m('br'),
      this.showLoginButton ? m('button', { onclick: () => submitLogin(this) }, 'Login') : null,
      this.errorValidation ? m('p', { style: 'color: #982c61' }, this.errorValidation) : null,
      m('span', { id: 'loginSpin' })
    ])
  }
}

const LoginModal = {
  view: () => m('.dialog', m('.dialogContent', [
    m('h2', 'Login'),
    m('button', { onclick: closeModal, class: 'dialog-close' }, 'Close'),
    m(LoginForm)
  ]))
}

// TODO: add logout
const Login = {
  view: () => m('main', [
    m('button', { onclick: () => stateChange.stateMutate('showLoginModal', true), class: 'button' }, 'Login'),
    stateChange.state.showLoginModal.value ? m(LoginModal) : null
  ])
}

const Repo = {
  view() {
    const state = storage.get('state')
    this.repoList = state.repoList.value
    this.username = state.username.value
    stateChange.state = state
    return m('.repoList', [
      m('h4', `Repositories List from ${this.username}`),
      m('h6', `Repositories: ${Object.keys(this.repoList).length}`),
      m('input[type=text][placeholder=Search]', 'Search'),
      m('ul', [
        Object.keys(this.repoList).map(e => m('li', e, [m('button', { style: 'margin-left: 40px;' }, 'Edit')]))
      ])
    ])
  }
}

const getLogin = () => storage.get('state') || { login: false }

const App = {
  view() {
    const isLogin = stateChange.state.login.value || getLogin().login.value
    return !isLogin ? m(Login) : m(Repo)
  }
}

m.mount(root, App)
