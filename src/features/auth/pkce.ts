interface PkceAttempt {
  codeVerifier: string
  codeChallenge: string
  state: string
}

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const generateRandomValue = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}

export const createPkceAttempt = async (): Promise<PkceAttempt> => {
  const codeVerifier = generateRandomValue(64)
  const verifierBytes = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', verifierBytes)

  return {
    codeVerifier,
    codeChallenge: toBase64Url(new Uint8Array(digest)),
    state: generateRandomValue(32),
  }
}
