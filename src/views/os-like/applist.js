import {reactive} from "vue"

export const appList = reactive([
  { id: 'resycle-bin', name: 'Recycle Bin', emoji: '🗑️' },
  { id: 'control-panel', name: 'Control Panel', emoji: '⚙️' },
  { id: 'file-manager', name: 'File Manager', emoji: '📁'},
  { id: 'notepad', name: 'Notepad', emoji: '📝' },
  { id: 'calculator', name: 'Calculator', emoji: '🧮' },
])
