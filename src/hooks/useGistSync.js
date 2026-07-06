import { useCallback, useEffect, useRef, useState } from 'react'
import { exportAll, importAll } from '../storage/local'
import {
  activateSync as gistActivate,
  clearGistConfig,
  isSyncConfigured,
  pull as gistPull,
  push as gistPush,
} from '../storage/gist'

const PUSH_DELAY = 2000

function timeOf(blob) {
  return blob?.updatedAt ? new Date(blob.updatedAt).getTime() : 0
}

function mergeBlob(local, remote) {
  if (!remote) return local
  if (!local) return remote
  return timeOf(remote) > timeOf(local) ? remote : local
}

function mergeEntries(localEntries = {}, remoteEntries = {}) {
  const merged = {}
  const dates = new Set([...Object.keys(localEntries), ...Object.keys(remoteEntries)])
  dates.forEach((date) => {
    merged[date] = mergeBlob(localEntries[date], remoteEntries[date])
  })
  return merged
}

function mergeAll(local, remote) {
  return {
    settings: mergeBlob(local.settings, remote.settings),
    templates: mergeBlob(local.templates, remote.templates),
    entries: mergeEntries(local.entries, remote.entries),
  }
}

// Orchestration de la synchro Gist : pull+fusion (démarrage, focus, visibilitychange)
// et push en debounce à chaque modification locale signalée via `notifyChange`.
export function useGistSync({ onMerged } = {}) {
  const [configured, setConfigured] = useState(() => isSyncConfigured())
  const [status, setStatus] = useState(() => (isSyncConfigured() ? 'syncing' : 'idle'))
  const [errorMessage, setErrorMessage] = useState('')

  const configuredRef = useRef(configured)
  configuredRef.current = configured
  const pushTimeoutRef = useRef(null)
  const pullInFlightRef = useRef(false)
  const onMergedRef = useRef(onMerged)
  onMergedRef.current = onMerged

  const reportError = useCallback((e) => {
    setStatus(e instanceof TypeError ? 'offline' : 'error')
    setErrorMessage(e?.message || String(e))
  }, [])

  const doPush = useCallback(async () => {
    if (!configuredRef.current) return
    setStatus('syncing')
    try {
      const data = await exportAll()
      await gistPush(data)
      setStatus('synced')
    } catch (e) {
      reportError(e)
    }
  }, [reportError])

  const schedulePush = useCallback(() => {
    if (!configuredRef.current) return
    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current)
    pushTimeoutRef.current = setTimeout(doPush, PUSH_DELAY)
  }, [doPush])

  const pullAndMerge = useCallback(async () => {
    if (!configuredRef.current || pullInFlightRef.current) return
    pullInFlightRef.current = true
    setStatus('syncing')
    try {
      const remote = await gistPull()
      if (remote) {
        const local = await exportAll()
        const merged = mergeAll(local, remote)
        await importAll(merged)
        await onMergedRef.current?.()
        schedulePush()
      }
      setStatus('synced')
    } catch (e) {
      reportError(e)
    } finally {
      pullInFlightRef.current = false
    }
  }, [reportError, schedulePush])

  const activate = useCallback(
    async (token, gistIdInput) => {
      setStatus('syncing')
      try {
        const local = await exportAll()
        await gistActivate(token, gistIdInput, local)
        setConfigured(true)
        configuredRef.current = true
        await pullAndMerge()
      } catch (e) {
        reportError(e)
        throw e
      }
    },
    [pullAndMerge, reportError],
  )

  const disable = useCallback(() => {
    clearGistConfig()
    setConfigured(false)
    setStatus('idle')
    setErrorMessage('')
  }, [])

  useEffect(() => {
    if (!configured) return undefined
    pullAndMerge()
    function onFocus() {
      pullAndMerge()
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') pullAndMerge()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured])

  return { configured, status, errorMessage, activate, disable, notifyChange: schedulePush }
}
