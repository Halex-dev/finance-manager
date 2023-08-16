//TODO DA VEDERE ASSOLUTAMENTE
/*{
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    badge: {
      color: 'primary',
      text: 'NEW',
    },
  },*/

export default [
  {
    component: 'CNavTitle',
    name: 'User',
  },
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/user/dashboard',
    icon: 'cil-speedometer',
  },
  {
    component: 'CNavItem',
    name: 'Income',
    to: '/user/income',
    icon: 'cil-money',
  },
  {
    component: 'CNavItem',
    name: 'Cost',
    to: '/user/cost',
    icon: 'cil-credit-card',
  },
  {
    component: 'CNavItem',
    name: 'Wallet',
    to: '/user/wallet',
    icon: 'cil-wallet',
  },
  {
    component: 'CNavTitle',
    name: 'Settings',
  },
  {
    component: 'CNavGroup',
    name: 'Edit',
    to: '/user/setting',
    icon: 'cil-bank',
    items: [
      {
        component: 'CNavItem',
        name: 'Category',
        to: '/user/setting/category',
      },
      {
        component: 'CNavItem',
        name: 'Type', //Like Cash, card etc
        to: '/user/setting/type',
      },
    ],
  }


  /*
    {
    component: 'CNavGroup',
    name: 'Base',
    to: '/base',
    icon: 'cil-puzzle',
    items: [
      {
        component: 'CNavItem',
        name: 'Accordion',
        to: '/base/accordion',
      },
    ],
  },
 
  {
     component: 'CNavItem',
     name: 'Download CoreUI',
     href: 'http://coreui.io/vue/',
     icon: { name: 'cil-cloud-download', class: 'text-white' },
     _class: 'bg-success text-white',
     target: '_blank'
   },
   {
     component: 'CNavItem',
     name: 'Try CoreUI PRO',
     href: 'http://coreui.io/pro/vue/',
     icon: { name: 'cil-layers', class: 'text-white' },
     _class: 'bg-danger text-white',
     target: '_blank'
   }
   */
]
