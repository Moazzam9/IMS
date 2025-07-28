module.exports = {
  appId: 'com.inventory.management',
  productName: 'Inventory Management System',
  files: [
    'dist/**/*',
    'electron.cjs',
    'preload.js'
  ],
  extraMetadata: {
    main: "electron.cjs"
  },
  directories: {
    buildResources: 'public',
    output: './dist_electron'
  },
  win: {
    target: 'nsis',
    icon: 'public/favicon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Inventory Management System",
    uninstallDisplayName: "Inventory Management System",
    installerIcon: "public/favicon.ico",
    uninstallerIcon: "public/favicon.ico"
  }
};