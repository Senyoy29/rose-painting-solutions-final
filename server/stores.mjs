// ─────────────────────────────────────────────────────────────
// Storage adapters. The app only ever talks to this small interface:
//
//   getJSON(key) / setJSON(key, value)
//   getBytes(key) → { data: Uint8Array, metadata } | null
//   setBytes(key, Uint8Array, metadata)
//   delete(key) / list(prefix) → string[]
//
// Production: Netlify Blobs (durable, per site, separate from deploys —
// redeploying the site never touches it). Local development and tests:
// a folder on disk, or memory.
// ─────────────────────────────────────────────────────────────
import fs from 'node:fs/promises'
import path from 'node:path'

export const STORE_NAMES = { content: 'rps-content', auth: 'rps-auth', media: 'rps-media' }

/** Netlify Blobs. `getStore` comes from the '@netlify/blobs' package. */
export function netlifyStores(getStore) {
  const wrap = (name) => {
    const s = getStore({ name, consistency: 'strong' })
    return {
      getJSON: (k) => s.get(k, { type: 'json' }),
      setJSON: (k, v) => s.setJSON(k, v),
      async getBytes(k) {
        const r = await s.getWithMetadata(k, { type: 'arrayBuffer' })
        return r ? { data: new Uint8Array(r.data), metadata: r.metadata || {} } : null
      },
      setBytes: (k, bytes, metadata = {}) =>
        s.set(k, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), { metadata }),
      delete: (k) => s.delete(k),
      async list(prefix = '') {
        const keys = []
        for await (const page of s.list({ prefix, paginate: true })) for (const b of page.blobs) keys.push(b.key)
        return keys
      },
    }
  }
  return { content: wrap(STORE_NAMES.content), auth: wrap(STORE_NAMES.auth), media: wrap(STORE_NAMES.media) }
}

/** A folder on disk — survives restarts, like Blobs survives redeploys. */
export function fileStores(root) {
  const wrap = (name) => {
    const dir = path.join(root, name)
    const file = (k) => path.join(dir, encodeURIComponent(k))
    const ensure = () => fs.mkdir(dir, { recursive: true })
    const readMeta = async (k) => {
      try {
        return JSON.parse(await fs.readFile(file(k) + '.meta', 'utf8'))
      } catch {
        return {}
      }
    }
    return {
      async getJSON(k) {
        try {
          return JSON.parse(await fs.readFile(file(k), 'utf8'))
        } catch (e) {
          if (e.code === 'ENOENT') return null
          throw e
        }
      },
      async setJSON(k, v) {
        await ensure()
        const tmp = file(k) + '.tmp'
        await fs.writeFile(tmp, JSON.stringify(v))
        await fs.rename(tmp, file(k)) // atomic replace
      },
      async getBytes(k) {
        try {
          return { data: new Uint8Array(await fs.readFile(file(k))), metadata: await readMeta(k) }
        } catch (e) {
          if (e.code === 'ENOENT') return null
          throw e
        }
      },
      async setBytes(k, bytes, metadata = {}) {
        await ensure()
        await fs.writeFile(file(k), bytes)
        await fs.writeFile(file(k) + '.meta', JSON.stringify(metadata))
      },
      async delete(k) {
        await fs.rm(file(k), { force: true })
        await fs.rm(file(k) + '.meta', { force: true })
      },
      async list(prefix = '') {
        try {
          return (await fs.readdir(dir))
            .filter((f) => !f.endsWith('.meta') && !f.endsWith('.tmp'))
            .map(decodeURIComponent)
            .filter((k) => k.startsWith(prefix))
            .sort()
        } catch {
          return []
        }
      },
    }
  }
  return { content: wrap(STORE_NAMES.content), auth: wrap(STORE_NAMES.auth), media: wrap(STORE_NAMES.media) }
}

/** In-memory (unit tests). */
export function memoryStores() {
  const wrap = () => {
    const m = new Map()
    return {
      getJSON: async (k) => (m.has(k) ? JSON.parse(m.get(k).json) : null),
      setJSON: async (k, v) => void m.set(k, { json: JSON.stringify(v) }),
      getBytes: async (k) => (m.has(k) && m.get(k).bytes ? { data: m.get(k).bytes, metadata: m.get(k).metadata } : null),
      setBytes: async (k, bytes, metadata = {}) => void m.set(k, { bytes: new Uint8Array(bytes), metadata }),
      delete: async (k) => void m.delete(k),
      list: async (prefix = '') => [...m.keys()].filter((k) => k.startsWith(prefix)).sort(),
    }
  }
  return { content: wrap(), auth: wrap(), media: wrap() }
}
