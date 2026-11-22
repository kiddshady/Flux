'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   OPAL — preload
   La única puerta entre el renderer y el sistema. Todo lo que NO esté acá, el
   renderer no lo puede hacer: no tiene require, ni fs, ni acceso al proceso
   principal. Esa es la idea.

   Regla: exponé funciones, nunca objetos de Electron. `ipcRenderer` en el
   window anula por completo el aislamiento de contexto.
   ═══════════════════════════════════════════════════════════════════════════ */

const { contextBridge, ipcRenderer } = require('electron');

/** Desenvuelve {ok,data|error} y convierte el error en una excepción real. */
const call = async (channel, ...args) => {
  const res = await ipcRenderer.invoke(channel, ...args);
  if (!res?.ok) throw new Error(res?.error || `Falló ${channel}`);
  return res.data;
};

contextBridge.exposeInMainWorld('opal', {
  info: () => call('app:info'),
  /** Los archivos de datos ilegibles que se apartaron en esta corrida. */
  asides: () => call('store:asides'),

  win: {
    minimize: () => ipcRenderer.send('win:minimize'),
    toggleMaximize: () => ipcRenderer.send('win:toggle-maximize'),
    close: () => ipcRenderer.send('win:close'),
    isMaximized: () => ipcRenderer.invoke('win:is-maximized'),
    /** El renderer le pasa a la ventana su color base ya resuelto (ver app.js). */
    setBackground: (hex) => ipcRenderer.send('win:set-bg', hex),
    /** El vidrio «acrilico»: la ventana deja ver el escritorio (main.cjs). */
    setAcrilico: (on) => ipcRenderer.send('win:set-acrilico', !!on),
    onMaximized: (cb) => {
      const handler = (_e, value) => cb(value);
      ipcRenderer.on('win:maximized', handler);
      return () => ipcRenderer.off('win:maximized', handler);
    },
  },

  /** Leer el portapapeles (el "Pegar" del menú de los campos). Escribir no
      pasa por acá: navigator.clipboard.writeText no pide permiso. */
  clip: {
    read: () => call('clip:read'),
  },

  /** Abre el PDF de un apunte (ruta relativa a la carpeta de teoría). */
  apunte: {
    abrir: (rel) => call('apunte:abrir', rel),
  },

  /** Actualización automática. `pending` existe porque el renderer puede
      montar DESPUÉS de que la descarga terminó, y ahí el evento ya pasó. */
  update: {
    pending: () => ipcRenderer.invoke('update:pending'),
    install: () => ipcRenderer.invoke('update:install'),
    check: () => ipcRenderer.invoke('update:check'),
    onReady: (cb) => {
      const handler = (_e, info) => cb(info);
      ipcRenderer.on('update:ready', handler);
      return () => ipcRenderer.off('update:ready', handler);
    },
  },

  settings: {
    get: () => call('settings:get'),
    save: (patch) => call('settings:save', patch),
  },

  /** Documento suelto: un borrador, un caché, el último estado de la UI. */
  doc: {
    read: (name, fallback = null) => call('doc:read', name, fallback),
    write: (name, data) => call('doc:write', name, data),
  },

  /** Colección: una carpeta con un archivo por ítem. */
  col: (name) => ({
    list: () => call('col:list', name),
    get: (id) => call('col:get', name, id),
    save: (item) => call('col:save', name, item),
    remove: (id) => call('col:remove', name, id),
    nextId: (prefix) => call('col:next-id', name, prefix),
  }),
});
