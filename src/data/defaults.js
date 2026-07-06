// Valeurs par défaut reprises de la maquette (voir CAHIER-DES-CHARGES.md §6)

export const DEFAULT_DAY_COLORS = {
  lundi: { bg: '#ECE4F7', accent: '#7C5CBF', ink: '#4B3B7A' },
  mardi: { bg: '#DEEBF8', accent: '#3E7CB1', ink: '#26506E' },
  mercredi: { bg: '#EFE9E2', accent: '#8A7E6E', ink: '#5E564A' },
  jeudi: { bg: '#E2F1DE', accent: '#5AA45C', ink: '#356A37' },
  vendredi: { bg: '#FBF3D3', accent: '#B79514', ink: '#7C6A12' },
}

export const DAY_LABELS = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
}

export const DAY_ORDER = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']

export const DEFAULT_HOURS = [
  { id: 'h1', kind: 'slot', start: '8:30', end: '9:00' },
  { id: 'h2', kind: 'slot', start: '9:00', end: '9:30' },
  { id: 'h3', kind: 'slot', start: '9:30', end: '9:50' },
  { id: 'h4', kind: 'slot', start: '9:50', end: '10:15' },
  { id: 'r1', kind: 'break', label: 'Récréation', start: '10:15', end: '10:50' },
  { id: 'h5', kind: 'slot', start: '10:50', end: '11:25' },
  { id: 'p1', kind: 'break', label: 'Pause méridienne', start: '11:25', end: '13:30' },
  { id: 'h6', kind: 'slot', start: '13:30', end: '14:00' },
  { id: 'h7', kind: 'slot', start: '14:00', end: '14:40' },
  { id: 'h8', kind: 'slot', start: '14:40', end: '15:15' },
  { id: 'r2', kind: 'break', label: 'Récréation', start: '15:15', end: '15:30' },
  { id: 'h9', kind: 'slot', start: '15:30', end: '15:50' },
  { id: 'h10', kind: 'slot', start: '15:50', end: '16:20' },
]

export function createDefaultSettings() {
  return {
    levelMode: 'double',
    levelLabels: { n1: 'GS', n2: 'CP' },
    school: { line1: 'École Pierre Dumonteil', line2: 'année 2025-2026' },
    dayColors: structuredClone(DEFAULT_DAY_COLORS),
    hours: structuredClone(DEFAULT_HOURS),
    printRectoVerso: false,
  }
}
