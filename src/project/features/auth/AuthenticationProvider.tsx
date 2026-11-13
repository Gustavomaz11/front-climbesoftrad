import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AuthenticationContext,
  type AuthenticationContextValue,
  type ContextChangeGuard,
} from './auth-context'
import {
  authenticate,
  changeOwnPassword,
  getAuthenticatedUser,
  logout as requestLogout,
  restoreAuthentication,
} from './authenticate'
import { ForcedPasswordChangeModal } from './components/ForcedPasswordChangeModal'
import { PhysicianSignatureModal } from '../physicians/components/PhysicianSignatureModal'
import type { AuthenticatedUser, AuthenticationStatus, LoginCredentials } from './auth.types'
import { companyRequestContext, selectRequestWorkspace } from '../companies/company-request-context'
import type { WorkspaceSelection } from '../companies/company.types'

const applySelection = (user: AuthenticatedUser) =>
  selectRequestWorkspace({
    companyId: user.activeCompany?.id ?? null,
    unitId: user.activeCompany?.selectedUnitId ?? null,
  })

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthenticationStatus>('loading')
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [workspaceEpoch, setWorkspaceEpoch] = useState(0)
  const [switchingContext, setSwitchingContext] = useState(false)
  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])
  const guards = useRef(new Set<ContextChangeGuard>())
  const identityVersion = useRef(0)
  const switching = useRef(false)

  useEffect(() => {
    let active = true
    const version = identityVersion.current
    void restoreAuthentication().then((restored) => {
      if (!active || version !== identityVersion.current) return
      if (restored) applySelection(restored)
      setUser(restored)
      setStatus(restored ? 'authenticated' : 'unauthenticated')
    })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const version = ++identityVersion.current
    const authenticated = await authenticate(credentials)
    if (version !== identityVersion.current) return
    applySelection(authenticated)
    setUser(authenticated)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    for(const guard of Array.from(guards.current)) await guard()
    identityVersion.current += 1
    try {
      await requestLogout()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const updated = await changeOwnPassword(currentPassword, newPassword)
    applySelection(updated)
    setUser(updated)
  }, [])

  const refreshUser = useCallback(async () => {
    const version = identityVersion.current
    const updated = await getAuthenticatedUser()
    if (version !== identityVersion.current) return
    const current = userRef.current
    if (
      JSON.stringify([current?.activeCompany, current?.permissions]) !==
      JSON.stringify([updated.activeCompany, updated.permissions])
    ) {
      setWorkspaceEpoch((value) => value + 1)
    }
    applySelection(updated)
    setUser(updated)
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || switchingContext) return
    const refresh = () => {
      void refreshUser().catch(() => {})
    }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [status, switchingContext, refreshUser])

  const registerContextChangeGuard = useCallback((guard: ContextChangeGuard) => {
    guards.current.add(guard)
    return () => {
      guards.current.delete(guard)
    }
  }, [])

  const selectWorkspace = useCallback(async (selection: WorkspaceSelection) => {
    if (switching.current) return
    const previous = companyRequestContext.capture().selection
    if (previous.companyId === selection.companyId && previous.unitId === selection.unitId) return
    switching.current = true
    setSwitchingContext(true)
    const cleanups: Array<() => void> = []
    let changed = false
    try {
      for (const guard of Array.from(guards.current)) {
        const cleanup = await guard()
        if (cleanup) cleanups.push(cleanup)
      }
      selectRequestWorkspace(selection)
      changed = true
      const updated = await getAuthenticatedUser(false)
      applySelection(updated)
      setUser(updated)
    } catch (error) {
      selectRequestWorkspace(previous)
      throw error
    } finally {
      cleanups.forEach((cleanup) => cleanup())
      if (changed) setWorkspaceEpoch((value) => value + 1)
      switching.current = false
      setSwitchingContext(false)
    }
  }, [])

  const value = useMemo<AuthenticationContextValue>(
    () => ({
      status,
      user,
      login,
      logout,
      changePassword,
      selectWorkspace,
      switchingContext,
      workspaceEpoch,
      refreshUser,
      registerContextChangeGuard,
    }),
    [
      status,
      user,
      login,
      logout,
      changePassword,
      selectWorkspace,
      switchingContext,
      workspaceEpoch,
      refreshUser,
      registerContextChangeGuard,
    ],
  )

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
      <ForcedPasswordChangeModal
        open={Boolean(user?.mustChangePassword)}
        onChangePassword={changePassword}
      />
      <PhysicianSignatureModal open={Boolean(user && !user.mustChangePassword && user.mustUploadSignature)} onDone={refreshUser} onClose={() => undefined} />
    </AuthenticationContext.Provider>
  )
}
