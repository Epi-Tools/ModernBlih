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
    },
    showCreateModal: {
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

const setStorage = (key, props) => new Promise(s => s(storage.set('state', props)))

const closeModal = () => {
  stateChange.stateMutate('showLoginModal', false)
  stateChange.stateMutate('showCreateModal', false)
  setStorage('state', stateChange.state)
  m.redraw()
}

const pwdValid = data => data.pwd.length >= 8 ? { value: true, ...data } : { value: false, error: 'Password must be at least 8 characters', ...data }

const emailValid = data => emailReg.test(data.email) ? { value: true, ...data } : { value: false, error: 'Wrong Email', ...data }

const nameValid = data => data.name.length >= 2 ? { value: true, ...data } : { value: false, error: 'Wrong Name', ...data }

const aclValid = data => data.acl === true || data.acl === false ? { value: true, ...data } : { value: false, error: 'Wrong acl', ...data }

const validateLogin = R.compose(emailValid, pwdValid)

const validateAdd = R.compose(aclValid, nameValid)

const getId = id => document.getElementById(id)

const newSpin = id => new Spinner(opts).spin(id)

const spin = R.compose(newSpin, getId)

const stop = spin => spin.stop()

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
  const { error } = validateLogin(ctx)
  if (error) {
    ctx.errorValidation = error
    return
  }
  ctx.errorValidation = null
  login(ctx)
}

const logout = () => {
  stateChange.stateMutate('token', '')
  stateChange.stateMutate('login', false)
  setStorage('state', stateChange.state)
  m.redraw()
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

const openLoginModal = () => {
  stateChange.stateMutate('showLoginModal', true)
  setStorage('state', stateChange.state)
}

// FIXME: token front hash
const Login = {
  view: () => m('main', [
    m('button', { onclick: openLoginModal }, 'Login'),
    stateChange.state.showLoginModal.value ? m(LoginModal) : null
  ])
}

const add = ctx => {
  wesh(ctx.name)
  wesh(ctx.acl)
}

const addSubmit = ctx => {
  const { error } = validateAdd(ctx)
  if (error) {
    ctx.errorValidation = error
    return
  }
  ctx.errorValidation = null
  add(ctx)
}

const AddForm = {
  oninit() {
    this.name = null
    this.acl = false
    this.showAddButton = true
    this.errorValidation = null
  },
  view() {
    return m('div', [
      m('label.label', { for: 'name' }, 'Name'),
      m('input.input[type=text][placeholder=Name]', { id: 'name', name: 'name', required: 'required',
        onchange: e => this.name = e.target.value }),
      m('label.label', { for: 'acl' }, 'Acl ramassage-tek'),
      m('input', { id: 'acl', type: 'checkbox', onclick: () => this.acl = !this.acl, checked: this.acl }),
      m('br'),
      this.showAddButton ? m('button', { onclick: () => addSubmit(this) }, 'Login') : null,
      this.errorValidation ? m('p', { style: 'color: #982c61' }, this.errorValidation) : null,
      m('span', { id: 'AddSpin' })
    ])
  }
}

const CreateModal = {
  view: () => m('.dialog', m('.dialogContent', [
    m('h2', 'Name'),
    m('button', { onclick: closeModal, class: 'dialog-close' }, 'Close'),
    m(AddForm)
  ]))
}

const openCreateModal = () => {
  stateChange.stateMutate('showCreateModal', true)
  setStorage('state', stateChange.state)
}

// TODO: search bar
const Repo = {
  view() {
    this.repoList = stateChange.state.repoList.value
    this.username = stateChange.state.username.value
    return m('.repoList', [
      m('h4', `Repositories List from ${this.username}`),
      m('h6', `Repositories: ${Object.keys(this.repoList).length}`),
      m('button', { onclick: openCreateModal, class: 'create-button' }, 'Create Repo'),
      m('button', { onclick: logout, class: 'logout-button' }, 'Logout'),
      stateChange.state.showCreateModal.value ? m(CreateModal) : null,
      m('input[type=text][placeholder=Search]', 'Search'),
      m('ul', [
        Object.keys(this.repoList).map(e => m('li', e, [m('button', { class: 'edit-button' }, 'Edit')]))
      ])
    ])
  }
}

const getLogin = () => storage.get('state') || { login: false }

const App = {
  view() {
    const state = storage.get('state')
    if (state === null || state === undefined) return m(Login)
    stateChange.state = state
    const isLogin = stateChange.state.login.value || getLogin().login.value
    return !isLogin ? m(Login) : m(Repo)
  }
}

m.mount(root, App)
