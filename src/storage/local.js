import { get, set, keys } from 'idb-keyval'
import { createDefaultSettings } from '../data/defaults'

const SETTINGS_KEY = 'settings'
const TEMPLATES_KEY = 'templates'
const ENTRY_PREFIX = 'entry:'

export async function getSettings() {
  const settings = await get(SETTINGS_KEY)
  return settings || createDefaultSettings()
}

export function saveSettings(settings) {
  return set(SETTINGS_KEY, settings)
}

export async function getTemplates() {
  const templates = await get(TEMPLATES_KEY)
  return templates || {}
}

export function saveTemplates(templates) {
  return set(TEMPLATES_KEY, templates)
}

export async function getEntry(date) {
  const entry = await get(`${ENTRY_PREFIX}${date}`)
  return entry || null
}

export function saveEntry(date, data) {
  return set(`${ENTRY_PREFIX}${date}`, data)
}

export async function listEntries() {
  const allKeys = await keys()
  const entryKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(ENTRY_PREFIX))
  const entries = {}
  await Promise.all(
    entryKeys.map(async (k) => {
      const date = k.slice(ENTRY_PREFIX.length)
      entries[date] = await get(k)
    }),
  )
  return entries
}

export async function exportAll() {
  const [settings, templates, entries] = await Promise.all([
    getSettings(),
    getTemplates(),
    listEntries(),
  ])
  return { settings, templates, entries }
}

export async function importAll(data) {
  const tasks = []
  if (data.settings) tasks.push(saveSettings(data.settings))
  if (data.templates) tasks.push(saveTemplates(data.templates))
  if (data.entries) {
    Object.entries(data.entries).forEach(([date, entry]) => {
      tasks.push(saveEntry(date, entry))
    })
  }
  await Promise.all(tasks)
}
