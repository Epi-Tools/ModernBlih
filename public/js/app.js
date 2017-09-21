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
    username: '',
    login: false,
    showLoginModal: {
      value: false
    }
  },
  stateMutate(name, props) {
    if (!this.state[name]) return
    if (typeof props !== 'object') props = { value: props }
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

const login = ctx => {
  const logSpin = spin('loginSpin')
  ctx.showLoginButton = false
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

const Login = {
  view: () => m('main', [
    m('button', { onclick: () => stateChange.stateMutate('showLoginModal', true), class: 'button' }, 'Login'),
    stateChange.state.showLoginModal.value ? m(LoginModal) : null
  ])
}

const Repo = {
  view() {
    return m('h2', 'Repository List')
  }
}

const App = {
  oninit() {
    const { login } = storage.get('state') || { login: false }
    this.login = login
  },
  view() {
    return !this.login ? m(Login) : m(Repo)
  }
}

m.mount(root, App)
