const root = document.getElementById('app')

const wesh = console.log

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

const login = ({ email, pwd }) => {
  
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
      m('button', { onclick: () => submitLogin(this) }, 'Login'),
      this.errorValidation ? m('p', { style: 'color: #982c61' }, this.errorValidation) : null
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
} 

const { login } = storage.get('state') || { login: false }

m.mount(root, !login ? Login : Repo)
