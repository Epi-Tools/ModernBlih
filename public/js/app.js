const root = document.getElementById('app')

const wesh = console.log

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

const LoginModal = {
  view: () => m('.dialog', m('.dialogContent', [
    m('h2', 'Login'),
    m('button', { onclick: closeModal }, 'Close')
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
