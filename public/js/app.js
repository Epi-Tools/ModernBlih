const root = document.getElementById('app')

const wesh = console.log

mx.storage(mx.DEFAULT_STORAGE_NAME, mx.SESSION_STORAGE)

const storage = mx.storage()

const state = {
  username: '',
  login: false
}

const openModal = () => {}

const Login = {
  view: () => m('main', [
    m('button', { onclick: openModal, class: 'button' }, 'Login')
  ])
}

const Repo = {
} 

const { login } = storage.get('state') || { login: false }

m.mount(root, !login ? Login : Repo)
