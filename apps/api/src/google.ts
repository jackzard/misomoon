import { HttpError, type Site } from './control'

/** Google OAuth shared by the Google import and Search Console. One web client serves both. */
export type GooglePurpose = 'import' | 'search'

const SCOPES: Record<GooglePurpose, string> = {
	import: 'https://www.googleapis.com/auth/analytics.readonly',
	search: 'https://www.googleapis.com/auth/webmasters.readonly',
}

export function googleConfigured(env: Env) {
	if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
		throw new HttpError(501, 'Google needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET: an OAuth client with the Analytics Data, Analytics Admin and Search Console APIs enabled')
	}
}

const callbackUrl = (origin: string) => `${origin}/api/v1/google/callback`

/**
 * The OAuth state also goes in a cookie for the Google routes, so the callback finishes
 * only in the browser that started the sign-in. It lasts as long as a grant may wait.
 * wrangler dev serves http, where the cookie goes without Secure.
 */
const STATE_COOKIE = 'misomoon_google'
const stateCookie = (url: URL, state: string, maxAge: number) =>
	`${STATE_COOKIE}=${state}; Path=/api/v1/google; Max-Age=${maxAge}; HttpOnly${url.protocol === 'https:' ? '; Secure' : ''}; SameSite=Lax`

/** Starts the OAuth consent; the grant id doubles as the OAuth state. */
export async function googleConnect(env: Env, site: Site, req: Request, purpose: GooglePurpose): Promise<Response> {
	googleConfigured(env)
	const origin = new URL(req.url).origin
	const id = crypto.randomUUID()
	await env.CONTROL.prepare('INSERT INTO google_auth (id, site_id, purpose, created_at) VALUES (?, ?, ?, ?)').bind(id, site.id, purpose, Date.now()).run()
	const q = new URLSearchParams({
		client_id: env.GOOGLE_CLIENT_ID!,
		redirect_uri: callbackUrl(origin),
		response_type: 'code',
		scope: SCOPES[purpose],
		access_type: 'offline',
		prompt: 'consent',
		state: id,
	})
	return Response.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${q}` }, { headers: { 'Set-Cookie': stateCookie(new URL(req.url), id, 3600) } })
}

async function tokenRequest(env: Env, body: Record<string, string>) {
	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, ...body }),
	})
	if (!res.ok) return null
	return (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number }
}

/** Google redirects here. Stores the tokens against the grant and returns to Settings with `google=` or `search=`. */
export async function googleCallback(env: Env, req: Request): Promise<Response> {
	googleConfigured(env)
	const url = new URL(req.url)
	const state = url.searchParams.get('state') ?? ''
	const clear = { 'Set-Cookie': stateCookie(url, '', 0) }
	const cookie = (req.headers.get('cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${STATE_COOKIE}=([^;]*)`))?.[1]
	// a callback link opened in another browser would connect someone else's Google account
	if (!state || cookie !== state) {
		return new Response(
			'<!doctype html><meta charset="utf-8"><title>Google sign-in refused</title><p>This Google sign-in was started in another browser. Open misomoon in the browser you use it in, go to <b>Settings</b> &gt; <b>Integrations</b>, and click <b>Connect</b> again.</p><p><a href="/">Open misomoon</a></p>',
			{ status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8', ...clear } },
		)
	}
	const grant = await env.CONTROL.prepare('SELECT site_id, purpose, created_at FROM google_auth WHERE id = ?').bind(state).first<{ site_id: string; purpose: GooglePurpose; created_at: number }>()
	const param = grant?.purpose === 'search' ? 'search' : 'google'
	const back = (q: string) => new Response(null, { status: 302, headers: { Location: `${url.origin}/?site=${encodeURIComponent(grant?.site_id ?? '')}&view=settings&tab=connect&${q}`, ...clear } })
	if (!grant || Date.now() - grant.created_at > 3_600_000) return back('google_error=expired')
	const code = url.searchParams.get('code')
	if (!code) return back(`google_error=${encodeURIComponent(url.searchParams.get('error') ?? 'denied')}`)
	const t = await tokenRequest(env, { code, redirect_uri: callbackUrl(url.origin), grant_type: 'authorization_code' })
	if (!t) return back('google_error=token')
	await env.CONTROL.prepare('UPDATE google_auth SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = ?')
		.bind(t.access_token, t.refresh_token ?? null, Date.now() + t.expires_in * 1000, state)
		.run()
	return back(`${param}=${state}`)
}

export interface GoogleTokens {
	access_token: string | null
	refresh_token: string | null
	expires_at: number | null
}

/** A usable access token, refreshed when it's about to expire. `save` stores a fresh one. */
export async function freshToken(env: Env, t: GoogleTokens | null, save: (token: string, expiresAt: number) => Promise<unknown>): Promise<string> {
	if (!t?.access_token) throw new HttpError(400, 'connect Google again')
	if ((t.expires_at ?? 0) > Date.now() + 60_000 || !t.refresh_token) return t.access_token
	const next = await tokenRequest(env, { refresh_token: t.refresh_token, grant_type: 'refresh_token' })
	if (!next) throw new HttpError(400, 'Google sign-in expired; connect again')
	await save(next.access_token, Date.now() + next.expires_in * 1000)
	return next.access_token
}

/** The token of a grant from the OAuth callback, for one site and purpose. */
export async function grantToken(env: Env, site: Site, grantId: string, purpose: GooglePurpose): Promise<string> {
	const g = await env.CONTROL.prepare('SELECT access_token, refresh_token, expires_at FROM google_auth WHERE id = ? AND site_id = ? AND purpose = ?').bind(grantId, site.id, purpose).first<GoogleTokens>()
	return freshToken(env, g, (token, exp) => env.CONTROL.prepare('UPDATE google_auth SET access_token = ?, expires_at = ? WHERE id = ?').bind(token, exp, grantId).run())
}

export async function google<T>(token: string, url: string, body?: unknown): Promise<T> {
	const res = await fetch(url, {
		method: body ? 'POST' : 'GET',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	})
	if (!res.ok) throw new HttpError(502, `Google: ${((await res.json().catch(() => null)) as { error?: { message?: string } } | null)?.error?.message ?? res.statusText}`)
	return (await res.json()) as T
}
