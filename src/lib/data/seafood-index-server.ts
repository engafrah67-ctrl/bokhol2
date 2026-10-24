/**
 * SERVER-ONLY helpers for reading/writing the managed seafood index.
 * Do NOT import this file in Client Components.
 */
import fs from 'fs'
import path from 'path'
import { ManagedIndexItem, DEFAULT_MANAGED_INDEX_ITEMS } from './seafood-index-data'

const OVERRIDES_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'seafood-index-overrides.json')

/** Migrate items saved with the old weekly field names to the new monthly names */
function migrateItem(item: any): ManagedIndexItem {
  return {
    ...item,
    monthlyChangePct: item.monthlyChangePct ?? item.weeklyChangePct ?? 1.0,
    monthHigh:        item.monthHigh        ?? item.weekHigh        ?? (item.latestPrice * 1.06),
    monthLow:         item.monthLow         ?? item.weekLow         ?? (item.latestPrice * 0.94),
  }
}

export function getManagedIndexItems(): ManagedIndexItem[] {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const content = fs.readFileSync(OVERRIDES_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(migrateItem)
      }
    }
  } catch (err) {
    console.warn('Failed to read seafood-index-overrides.json, using defaults:', err)
  }
  return DEFAULT_MANAGED_INDEX_ITEMS
}

export function saveManagedIndexItems(items: ManagedIndexItem[]): boolean {
  try {
    const dir = path.dirname(OVERRIDES_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(items, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to save seafood-index-overrides.json:', err)
    return false
  }
}
