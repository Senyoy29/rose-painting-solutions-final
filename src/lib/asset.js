// Resolves a path inside /public so it works on any hosting sub-path.
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
