// Netlify Function: the content & photo API (see server/app.mjs).
// Storage is Netlify Blobs — durable and separate from deploys.
import { getStore } from '@netlify/blobs'
import { purgeCache } from '@netlify/functions'
import { createApp } from '../../server/app.mjs'
import { netlifyStores } from '../../server/stores.mjs'

let app
export default async (req, context) => {
  app ||= createApp({
    stores: netlifyStores(getStore),
    env: process.env,
    // On publish, drop the CDN's cached copy of /api/content so the change shows at once.
    purgeContentCache: () => purgeCache({ tags: ['rps-content'] }),
  })
  return app(req, { ip: context?.ip })
}

export const config = {
  path: ['/api/*', '/media/*'],
}
