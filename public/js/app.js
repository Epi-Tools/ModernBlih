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
    },
    showEditModal: {
      value: false
    },
    showDeleteModal: {
      value: false
    },
    selectedRepo: {
      value: ''
    },
    repoFilterList: {
      value: []
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
  stateChange.stateMutate('showEditModal', false)
  stateChange.stateMutate('showDeleteModal', false)
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

// TODO: add error gestion
const getRepositories = () => axios.post('/api/repo/list', { email: stateChange.state.username.value,
  token: stateChange.state.token.value }).then(({ data }) => {
  stateChange.stateMutate('repoList', data.body.repositories)
  closeModal()
  m.redraw()
}).catch(console.error)

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

// TODO: add loader
const add = ctx => axios.post('/api/repo/create', {
  name: ctx.name,
  acl: ctx.acl,
  email: stateChange.state.username.value,
  token: stateChange.state.token.value })
  .then(getRepositories)
  .catch(console.error)

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
      m('input', { id: 'acl', type: 'checkbox', oninput: () => this.acl = !this.acl, value: this.acl }),
      m('br'),
      this.showAddButton ? m('button', { onclick: () => addSubmit(this) }, 'Add') : null,
      this.errorValidation ? m('p', { style: 'color: #982c61' }, this.errorValidation) : null,
      m('span', { id: 'AddSpin' })
    ])
  }
}

const getAcl = (e, ctx) => axios.post('/api/repo/acl/list', {
  name: e,
  email: stateChange.state.username.value,
  token: stateChange.state.token.value })
  .then(({ data }) => {
    ctx.aclList = Object.keys(data.body).map(e => ({ name: e, acl: data.body[e] }))
    m.redraw()
  })
  .catch(console.error)

const edit = (ctx, acl) => {
  wesh(acl)
}

// TODO: (carlendev) use show "something" button
const EditForm = {
  async oninit() {
    getAcl(stateChange.state.selectedRepo.value, this)
    this.name = null
    this.showEditButton = true
    this.errorValidation = null
    this.acl = 'r'
  },
  view() {
    return m('div', [
      m('label.label', { for: 'name' }, 'List of logins'),
      m('ul', this.aclList ? this.aclList.map(e => m('li', { style: 'list-style-type: none;' },
        m('div', [ m('span', `${e.name}\t | `), m('strong', e.acl),
          m('button', { onclick: () => edit(this, ''), class: 'delete-button' }, 'Delete') ]))) : null),
      m('input.input[type=text][placeholder=Name]', { id: 'name', name: 'name', required: 'required',
        onchange: e => this.name = e.target.value }),
      m('select', { id: 'acl',name: 'acl', required: 'required',
        onchange: e => this.acl = e.target.value }, [
        m('option', { value: 'r' }, 'r'),
        m('option', { value: 'w' }, 'w'),
        m('option', { value: 'rw' }, 'rw'),
        m('option', { value: '' }, 'Nothing')
      ]),
      m('br'),
      this.showEditButton ? m('button', { onclick: () => edit(this, this.acl) }, 'Update') : null,
      this.errorValidation ? m('p', { style: 'color: #982c61' }, this.errorValidation) : null,
      m('span', { id: 'AddSpin' })
    ])
  } 
}

const mDelete = ctx => {
  ctx.showDeleteButton = false
  return axios.post('/api/repo/delete', { email: stateChange.state.username.value,
    token: stateChange.state.token.value,
    name: ctx.name }).then(() => axios.post('/api/repo/list', { email: stateChange.state.username.value,
    token: stateChange.state.token.value }).then(({ data }) => {
    stateChange.stateMutate('repoList', data.body.repositories)
    ctx.showDeleteButton = true
    closeModal()
    m.redraw()
  }).catch(console.error)).catch(e => {
    console.error(e)
    ctx.showDeleteButton = true
  })
}

const DeleteForm = {
  oninit() {
    this.name = stateChange.state.selectedRepo.value
    this.showDeleteButton = true
  },
  view() {
    return m('div', [
      m('h4', `${this.name} ?`),
      this.showDeleteButton ? m('button', { onclick: () => mDelete(this), style: 'width: 100px;' }, 'Yes') : null
    ])
  }
}

const getModalPattern = (form, title) => m('.dialog', m('.dialogContent', [
  m('h2', title),
  m('button', { onclick: closeModal, class: 'dialog-close' }, 'Close'),
  m(form)
]))

const CreateModal = { view: () => getModalPattern(AddForm, 'Create Repo') }

const EditModal = { view: () => getModalPattern(EditForm, 'ACLS') }

const LoginModal = { view: () => getModalPattern(LoginForm, 'Login') }

const DeleteModal = { view: () => getModalPattern(DeleteForm, 'Delete') }

const openModal = msg => {
  stateChange.stateMutate(msg, true)
  setStorage('state', stateChange.state)
}

const openCreateModal = () => openModal('showCreateModal')

const openEditModal = () => openModal('showEditModal')

const openLoginModal = () => openModal('showLoginModal')

const openDeleteModal = () => openModal('showDeleteModal')

// FIXME: token front hash
const Login = {
  view: () => m('main', [
    m('button', { onclick: openLoginModal }, 'Login'),
    stateChange.state.showLoginModal.value ? m(LoginModal) : null
  ])
}

const toUper = (filter, ...e) => [ filter.toUpperCase(), e.map(e => ({ name: e.toUpperCase(), id: e })) ]

const match = ([ filter, rest ]) => rest.filter(e => e.indexOf(filter) !== -1)

const bakeRepoFilter = repos => stateChange.stateMutate('repoFilterList',
  Object.keys(stateChange.state.repoList.value).filter(e => repos.find(user => e === user)))

const bakeFilter = R.compose(bakeRepoFilter, match, toUper)

const filter = (value, ctx) => new Promise(s => s(bakeFilter(value, ...Object.keys(ctx.repoList))))

// TODO: search bar
const Repo = {
  filter: (e, ctx) => filter(e.target.value, ctx),
  view({ state }) {
    this.repoList = stateChange.state.repoList.value
    this.username = stateChange.state.username.value
    return m('.repoList', [
      m('h4', `Repositories List from ${this.username}`),
      m('h6', `Repositories: ${Object.keys(this.repoList).length}`),
      m('button', { onclick: openCreateModal, class: 'create-button' }, 'Create Repo'),
      m('button', { onclick: logout, class: 'logout-button' }, 'Logout'),
      stateChange.state.showCreateModal.value ? m(CreateModal) : null,
      stateChange.state.showEditModal.value ? m(EditModal) : null,
      stateChange.state.showDeleteModal.value ? m(DeleteModal) : null,
      m('input[type=text][placeholder=Search]', { style: 'width: 400px;', onkeyup: e => state.filter(e, this) }, 'Search'),
      m('ul', { style: 'padding-left: 0;' }, [
        Object.keys(this.repoList).map(e => m('li', { class: 'repo-row', style: 'list-style-type: none;' }, [
          m('div', { style: 'display: inline-block; width: 550px;' }, e),
          m('div', { style: 'display: inline-block; width: 150px;' }, [
            m('button', { onclick: () => {
              stateChange.stateMutate('selectedRepo', e)
              openEditModal()
            },
            style: 'margin-right: 10px;' }, 'Acl'),
            m('button', { onclick: () => {
              stateChange.stateMutate('selectedRepo', e)
              openDeleteModal()
            } }, 'Delete'),
          ]),
          m('hr')
        ]))
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

const hanldeEscape = () => {
  const { state } = stateChange
  if (state.showCreateModal.value !== true &&
      state.showLoginModal.value !== true &&
      state.showEditModal.value !== true &&
      state.showDeleteModal.value !== true) return
  closeModal()
}

window.addEventListener('keydown', e => {
  if (e.keyCode === 27) return hanldeEscape()
  return e
})
