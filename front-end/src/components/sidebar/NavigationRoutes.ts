export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'transactions',
      displayName: 'menu.transactions',
      meta: {
        icon: 'payments',
      },
    },
    {
      name: 'wallets',
      displayName: 'menu.wallets',
      meta: {
        icon: 'wallet',
      },
    },
    {
      name: 'categories',
      displayName: 'menu.categories',
      meta: {
        icon: 'category',
      },
    },
    {
      name: 'settings',
      displayName: 'menu.settings',
      meta: {
        icon: 'settings',
      },
    },
  ] as INavigationRoute[],
}
