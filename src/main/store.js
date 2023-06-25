import Store from 'electron-store'

const store = new Store()

const getStoreKey = (event, key) => {
  return store.get(key)
}

export { getStoreKey }
export default store
