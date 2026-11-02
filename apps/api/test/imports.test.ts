import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { invalidate } from '../src/control'
import { fakeCtx, fakeEnv, OWNER, type FakeEnv } from './fake'

vi.mock('@misomoon/tracker/m.min.js', () => ({ default: '/* m.js */' }))
const { default: worker } = await import('../src/index')

async function call(env: FakeEnv, method: string, path: string, body?: BodyInit, headers: Record<string, string> = {}) {
	const ctx = fakeCtx()
	const res = await worker.fetch(new Request(`https://app.test${path}`, { method, headers: { ...OWNER, ...headers }, body }), env as unknown as Env, ctx as unknown as ExecutionContext)
	await ctx.settle()
	return res
}

/** A visitors CSV with one row per day for `days` days from 2022-01-01. */
function visitorsCsv(days: number) {
	const rows = Array.from({ length: days }, (_, i) => `${new Date(Date.UTC(2022, 0, 1 + i)).toISOString().slice(0, 10)},10,30,4,12,600`)
	return new File([`date,visitors,pageviews,bounces,visits,visit_duration\n${rows.join('\n')}\n`], 'imported_visitors_20220101_20240630.csv', { type: 'text/csv' })
}

/** A visitors CSV with one row per day for `days` days from `from`. */
function daysCsv(from: string, days: number) {
	const start = Date.parse(from + 'T00:00:00Z')
	const rows = Array.from({ length: days }, (_, i) => `${new Date(start + i * 86_400_000).toISOString().slice(0, 10)},10,30,4,12,600`)
	return new File([`date,visitors,pageviews,bounces,visits,visit_duration\n${rows.join('\n')}\n`], 'imported_visitors.csv', { type: 'text/csv' })
}

const upload = (env: FakeEnv, file: File) => {
	const form = new FormData()
	form.append('file', file)
	return call(env, 'POST', '/api/v1/sites/shop-com/imports', form)
}

/** The local days of the stored site totals, oldest first. */
const importedDays = (env: FakeEnv, zone = 'UTC') =>
	[...env.SHARD_0.rows("SELECT ts FROM imported WHERE dim = ''"), ...env.SHARD_1.rows("SELECT ts FROM imported WHERE dim = ''")]
		.map((r) => new Date((r as { ts: number }).ts).toLocaleDateString('sv-SE', { timeZone: zone }))
		.sort()

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
/** A pageview misomoon counts now, so the site's first counted day is today. */
const pageview = (env: FakeEnv) =>
	call(env, 'POST', '/api/event', JSON.stringify({ s: 'shop-com', n: 'pageview', u: 'https://shop.com/' }), { 'content-type': 'application/json', 'user-agent': UA, 'cf-connecting-ip': '198.51.100.7' })

beforeEach(() => invalidate(''))
afterEach(() => {
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

describe('imports skip days already counted', () => {
	async function site(timezone = 'UTC') {
		const env = fakeEnv()
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com', timezone }), { 'content-type': 'application/json' })
		return env
	}

	it('stops a CSV import the day before misomoon counted its first pageview', async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(Date.UTC(2024, 2, 10, 12))
		const env = await site()
		expect((await pageview(env)).status).toBe(202)
		const res = await upload(env, daysCsv('2024-03-05', 10))
		expect(res.status).toBe(201)
		expect(await res.json()).toMatchObject({ status: 'done', from_day: '2024-03-05', to_day: '2024-03-09', skipped_days: 5 })
		expect(importedDays(env)).toEqual(['2024-03-05', '2024-03-06', '2024-03-07', '2024-03-08', '2024-03-09'])
	})

	it("finds the first counted day in the site's time zone", async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		// 03:00 UTC on 10 March is 22:00 on 9 March in New York
		vi.setSystemTime(Date.UTC(2024, 2, 10, 3))
		const env = await site('America/New_York')
		await pageview(env)
		const res = await upload(env, daysCsv('2024-03-07', 4))
		expect(await res.json()).toMatchObject({ from_day: '2024-03-07', to_day: '2024-03-08', skipped_days: 2 })
		expect(importedDays(env, 'America/New_York')).toEqual(['2024-03-07', '2024-03-08'])
	})

	it('keeps every day when misomoon has counted nothing yet', async () => {
		const env = await site()
		const res = await upload(env, daysCsv('2022-01-01', 3))
		expect(await res.json()).toMatchObject({ from_day: '2022-01-01', to_day: '2022-01-03', skipped_days: 0 })
	})

	it('takes from a second import only the days no earlier import covers', async () => {
		const env = await site()
		await upload(env, daysCsv('2022-01-01', 10))
		const res = await upload(env, daysCsv('2021-12-25', 12))
		expect(await res.json()).toMatchObject({ from_day: '2021-12-25', to_day: '2021-12-31', skipped_days: 5 })
		expect(importedDays(env)).toHaveLength(17)
	})

	it('refuses an upload whose every day is already counted, and stores nothing', async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(Date.UTC(2024, 2, 10, 12))
		const env = await site()
		await pageview(env)
		const res = await upload(env, daysCsv('2024-03-10', 3))
		expect([res.status, await res.json()]).toEqual([400, { error: 'misomoon has counted this site since 2024-03-10, and every day in this import is on or after it, so there is nothing to add' }])
		await upload(env, daysCsv('2022-01-01', 3))
		const again = await upload(env, daysCsv('2022-01-02', 2))
		expect([again.status, await again.json()]).toEqual([400, { error: 'earlier imports already cover every day in this import, so there is nothing to add' }])
		expect(env.CONTROL.rows('SELECT from_day FROM imports')).toEqual([{ from_day: '2022-01-01' }])
	})

	it('asks Google for days up to the one before misomoon counted its first pageview', async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(Date.UTC(2024, 2, 10, 12))
		const env = fakeEnv({ GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' })
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })
		await pageview(env)
		grant(env, 'g1', Date.now())
		const ranges: unknown[] = []
		vi.stubGlobal('fetch', async (_: string, init: RequestInit) => (ranges.push(JSON.parse(String(init.body)).dateRanges), Response.json({ rows: [] })))
		// a To after the first counted day, and no To at all, both end the day before it
		for (const to of ['2024-06-01', undefined]) {
			ranges.length = 0
			const res = await call(env, 'POST', '/api/v1/sites/shop-com/imports/google', JSON.stringify({ grant: 'g1', property: 'properties/123', from: '2024-01-01', to }), { 'content-type': 'application/json' })
			expect(res.status).toBe(202)
			expect(ranges[0]).toEqual([{ startDate: '2024-01-01', endDate: '2024-03-09' }])
			grant(env, 'g1', Date.now())
		}
	})
})

describe('CSV imports', () => {
	it("stores each day at that day's midnight in the site's time zone, across a DST change", async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(Date.UTC(2024, 6, 1))
		const env = fakeEnv()
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com', timezone: 'America/New_York' }), { 'content-type': 'application/json' })
		const form = new FormData()
		form.append('file', visitorsCsv(1))
		expect((await call(env, 'POST', '/api/v1/sites/shop-com/imports', form)).status).toBe(201)
		vi.useRealTimers()
		// 2022-01-01 is in EST (UTC-5), though July is EDT (UTC-4)
		const ts = [...env.SHARD_0.rows('SELECT DISTINCT ts FROM imported'), ...env.SHARD_1.rows('SELECT DISTINCT ts FROM imported')]
		expect(ts).toEqual([{ ts: Date.UTC(2022, 0, 1, 5) }])
	})

	it('leaves no rows behind when an import fails part way, so a retry does not count days twice', async () => {
		const env = fakeEnv()
		expect((await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })).status).toBe(201)
		// the second write batch fails, after the first one committed
		let batches = 0
		for (const shard of [env.SHARD_0, env.SHARD_1]) {
			const batch = shard.batch.bind(shard)
			shard.batch = async (stmts) => (++batches === 2 ? Promise.reject(new Error('D1 network error')) : batch(stmts))
		}
		const form = new FormData()
		form.append('file', visitorsCsv(900))
		expect((await call(env, 'POST', '/api/v1/sites/shop-com/imports', form)).status).toBe(500)
		expect(batches).toBe(2)
		expect(env.CONTROL.rows("SELECT status FROM imports")).toEqual([{ status: 'failed' }])
		expect([...env.SHARD_0.rows('SELECT 1 FROM imported'), ...env.SHARD_1.rows('SELECT 1 FROM imported')]).toEqual([])
	})
})

describe("another tool's export", () => {
	/** a real CSV export of page views, gzipped as the tool sends it (packages/core/test/importers/fixtures) */
	const REAL = readFileSync(new URL('../../../packages/core/test/importers/fixtures/goatcounter-export.csv', import.meta.url))

	it('reads a gzipped export of page views in the site time zone', async () => {
		const env = fakeEnv()
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com', timezone: 'America/New_York' }), { 'content-type': 'application/json' })
		const res = await upload(env, new File([gzipSync(REAL)], 'export-20201231T000000Z-0.csv.gz', { type: 'application/gzip' }))
		expect(res.status).toBe(201)
		expect(await res.json()).toMatchObject({ source: 'csv', status: 'done', from_day: '2020-11-30', to_day: '2020-12-26' })
		expect(importedDays(env, 'America/New_York')).toEqual(['2020-11-30', '2020-12-26'])
	})

	it('counts raw page views and events uploaded together into visits', async () => {
		const env = fakeEnv()
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com', timezone: 'Europe/Amsterdam' }), { 'content-type': 'application/json' })
		const fixture = (name: string) => new File([readFileSync(new URL(`../../../packages/core/test/importers/fixtures/${name}`, import.meta.url))], name, { type: 'text/csv' })
		const form = new FormData()
		form.append('file', fixture('simpleanalytics-pageviews.csv'))
		form.append('file', fixture('simpleanalytics-events.csv'))
		const res = await call(env, 'POST', '/api/v1/sites/shop-com/imports', form)
		expect(res.status).toBe(201)
		expect(await res.json()).toMatchObject({ source: 'csv', status: 'done', from_day: '2026-10-20', to_day: '2026-10-20' })
		// the real day's visitors, visits, page views and bounces
		const shards = [env.SHARD_0, env.SHARD_1].flatMap((db) => db.rows("SELECT visitors, visits, pageviews, bounces FROM imported WHERE dim = ''"))
		expect(shards).toEqual([{ visitors: 625, visits: 685, pageviews: 817, bounces: 273 }])
	})

	it('answers 400 with the reason for an export it reads in another version, or a broken gzip file', async () => {
		const env = fakeEnv()
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })
		const old = await upload(env, new File([REAL.toString().replace('2Path', '1Path')], 'export.csv', { type: 'text/csv' }))
		expect([old.status, (await old.json()).error]).toEqual([400, expect.stringMatching(/version 1; misomoon reads version 2/)])
		const broken = await upload(env, new File(['not gzip'], 'export.csv.gz'))
		expect([broken.status, await broken.json()]).toEqual([400, { error: "export.csv.gz isn't a gzip file" }])
		expect(env.CONTROL.rows('SELECT 1 FROM imports')).toEqual([])
	})
})

const HOUR = 3_600_000
const grant = (env: FakeEnv, id: string, createdAt: number) =>
	env.CONTROL.db.prepare("INSERT INTO google_auth (id, site_id, purpose, access_token, refresh_token, expires_at, created_at) VALUES (?, 'shop-com', 'import', 'ya29.token', '1//refresh', ?, ?)").run(id, Date.now() + HOUR, createdAt)

describe('Google imports', () => {
	it('takes only a property id that names a Google property, and encodes the page token', async () => {
		const env = fakeEnv({ GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' })
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })
		grant(env, 'g1', Date.now())
		const urls: string[] = []
		vi.stubGlobal('fetch', async (url: string) => {
			urls.push(url)
			return Response.json(urls.length === 1 ? { accountSummaries: [], nextPageToken: 'a+b/c=' } : { accountSummaries: [] })
		})
		for (const property of ['properties/123/../../v1alpha/x', 'properties/123?key=1', 'properties/'])
			expect((await call(env, 'POST', '/api/v1/sites/shop-com/imports/google', JSON.stringify({ grant: 'g1', property }), { 'content-type': 'application/json' })).status).toBe(400)
		expect(urls).toEqual([])
		expect((await call(env, 'GET', '/api/v1/sites/shop-com/imports/google/properties?grant=g1')).status).toBe(200)
		expect(urls[1]).toBe('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200&pageToken=a%2Bb%2Fc%3D')
	})

	it('drops the Google grant when the import fails', async () => {
		const env = fakeEnv({ GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' })
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })
		grant(env, 'g1', Date.now())
		vi.stubGlobal('fetch', async () => Response.json({ error: { message: 'Quota exceeded' } }, { status: 429 }))
		const res = await call(env, 'POST', '/api/v1/sites/shop-com/imports/google', JSON.stringify({ grant: 'g1', property: 'properties/123' }), { 'content-type': 'application/json' })
		expect(res.status).toBe(202)
		expect(env.CONTROL.rows('SELECT status, error FROM imports')).toEqual([{ status: 'failed', error: 'Google: Quota exceeded' }])
		expect(env.CONTROL.rows('SELECT id FROM google_auth')).toEqual([])
	})

	it('fails an import cut off for an hour, with none of its rows, and forgets grants a day old', async () => {
		const env = fakeEnv()
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })
		const form = new FormData()
		form.append('file', visitorsCsv(30))
		await call(env, 'POST', '/api/v1/sites/shop-com/imports', form)
		const imported = () => [...env.SHARD_0.rows('SELECT 1 FROM imported'), ...env.SHARD_1.rows('SELECT 1 FROM imported')].length
		expect(imported()).toBeGreaterThan(0)
		// as a background import the Worker stopped part way leaves it
		env.CONTROL.db.prepare("UPDATE imports SET status = 'importing', created_at = ?").run(Date.now() - 2 * HOUR)
		env.CONTROL.db.prepare("INSERT INTO imports (id, site_id, source, label, status, created_at) VALUES ('running', 'shop-com', 'google', 'Google', 'importing', ?)").run(Date.now() - 10 * 60_000)
		grant(env, 'old', Date.now() - 25 * HOUR)
		grant(env, 'new', Date.now() - HOUR)
		const ctx = fakeCtx()
		await worker.scheduled({} as ScheduledController, env as unknown as Env, ctx as unknown as ExecutionContext)
		await ctx.settle()
		expect(env.CONTROL.rows('SELECT id, status, error FROM imports ORDER BY created_at')).toEqual([
			{ id: expect.any(String), status: 'failed', error: 'The import stopped before it finished. Delete it and start again.' },
			{ id: 'running', status: 'importing', error: null },
		])
		expect(imported()).toBe(0)
		expect(env.CONTROL.rows('SELECT id FROM google_auth')).toEqual([{ id: 'new' }])
	})
})

describe('Google sign-in', () => {
	const COOKIE = 'misomoon_google'
	/** starts a Search Console sign-in and returns its state and the cookie the browser got */
	async function start() {
		const env = fakeEnv({ GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' })
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })
		const res = await call(env, 'POST', '/api/v1/sites/shop-com/search-console/connect')
		const state = new URL((await res.json()).url).searchParams.get('state')!
		const sent: string[] = []
		vi.stubGlobal('fetch', async (url: string) => (sent.push(url), Response.json({ access_token: 'ya29', refresh_token: '1//r', expires_in: 3600 })))
		return { env, state, cookie: res.headers.get('set-cookie'), sent }
	}
	const callback = (env: FakeEnv, state: string, cookie?: string) => call(env, 'GET', `/api/v1/google/callback?state=${state}&code=abc`, undefined, cookie ? { cookie } : {})
	const tokens = (env: FakeEnv) => env.CONTROL.rows('SELECT access_token FROM google_auth')

	it('ties the sign-in to the browser that started it with an HttpOnly cookie for the Google routes', async () => {
		const { state, cookie } = await start()
		expect(cookie).toBe(`${COOKIE}=${state}; Path=/api/v1/google; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`)
	})

	it('finishes the sign-in when the cookie matches the state, and clears the cookie', async () => {
		const { env, state, sent } = await start()
		const res = await callback(env, state, `${COOKIE}=${state}`)
		expect([res.status, res.headers.get('location'), res.headers.get('set-cookie')]).toEqual([
			302,
			`https://app.test/?site=shop-com&view=settings&tab=connect&search=${state}`,
			`${COOKIE}=; Path=/api/v1/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
		])
		expect([sent, tokens(env)]).toEqual([['https://oauth2.googleapis.com/token'], [{ access_token: 'ya29' }]])
	})

	it('refuses a callback without the cookie or with another sign-in\'s, before asking Google for tokens', async () => {
		const { env, state, sent } = await start()
		for (const cookie of [undefined, `${COOKIE}=${crypto.randomUUID()}`]) {
			const res = await callback(env, state, cookie)
			expect([res.status, res.headers.get('content-type'), res.headers.get('set-cookie')]).toEqual([403, 'text/html; charset=utf-8', `${COOKIE}=; Path=/api/v1/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax`])
			expect(await res.text()).toContain('This Google sign-in was started in another browser.')
		}
		expect([sent, tokens(env)]).toEqual([[], [{ access_token: null }]])
	})
})

describe('Search Console', () => {
	it('revokes the token at Google in the request body when a site disconnects', async () => {
		const env = fakeEnv({ GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' })
		await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com' }), { 'content-type': 'application/json' })
		env.CONTROL.db.prepare("INSERT INTO search_console (site_id, property, access_token, refresh_token, expires_at, created_at) VALUES ('shop-com', 'sc-domain:shop.com', 'ya29', '1//refresh', 0, 0)").run()
		const sent: { url: string; body: string; type: string | null }[] = []
		vi.stubGlobal('fetch', async (url: string, init: RequestInit) => (sent.push({ url, body: String(init.body), type: new Headers(init.headers).get('content-type') }), new Response(null)))
		expect((await call(env, 'DELETE', '/api/v1/sites/shop-com/search-console')).status).toBe(204)
		expect(sent).toEqual([{ url: 'https://oauth2.googleapis.com/revoke', body: 'token=1%2F%2Frefresh', type: 'application/x-www-form-urlencoded' }])
		expect(env.CONTROL.rows('SELECT 1 FROM search_console')).toEqual([])
	})

	describe('search terms are for the team only', () => {
		const TEAM_ONLY = { error: "search terms are shown to the site's team only" }
		const terms = '/api/v1/stats/breakdown?site=shop-com&period=30d&property=search_term'
		/** a public site with Search Console connected, and the token of a shared link to it */
		async function connected() {
			const env = fakeEnv({ GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' })
			await call(env, 'POST', '/api/v1/sites', JSON.stringify({ domain: 'shop.com', public: true }), { 'content-type': 'application/json' })
			env.CONTROL.db.prepare(`INSERT INTO search_console (site_id, property, access_token, refresh_token, expires_at, created_at) VALUES ('shop-com', 'sc-domain:shop.com', 'ya29', '1//refresh', ${Date.now() + 3_600_000}, 0)`).run()
			vi.stubGlobal('fetch', async () => Response.json({ rows: [{ keys: ['shop analytics'], clicks: 9, impressions: 120, ctr: 0.075, position: 4 }] }))
			const { slug } = await (await call(env, 'POST', '/api/v1/sites/shop-com/shared', JSON.stringify({ name: 'Client' }), { 'content-type': 'application/json' })).json()
			const { token } = await (await call(env, 'POST', `/api/v1/share/${slug}`, '{}', { 'content-type': 'application/json' })).json()
			return { env, shared: { authorization: `Bearer ${token}` } }
		}

		it('shows them to a member of the team', async () => {
			const { env } = await connected()
			const res = await call(env, 'GET', terms)
			expect([res.status, (await res.json()).rows.map((r: { key: string }) => r.key)]).toEqual([200, ['shop analytics']])
		})

		it('refuses a shared link and an anonymous viewer of a public site with 403', async () => {
			const { env, shared } = await connected()
			for (const auth of [shared, { authorization: '' }]) {
				const res = await call(env, 'GET', terms, undefined, auth)
				expect([res.status, await res.json()]).toEqual([403, TEAM_ONLY])
			}
		})

		it('refuses the get_search_terms MCP tool to a shared link', async () => {
			const { env, shared } = await connected()
			const rpc = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get_search_terms', arguments: { site: 'shop-com', period: '30d' } } })
			const res = await call(env, 'POST', '/mcp', rpc, { ...shared, 'content-type': 'application/json' })
			expect((await res.json()).result).toEqual({ content: [{ type: 'text', text: TEAM_ONLY.error }], isError: true })
		})

		it('lists the site under search in /me for the team, not for a shared link or a public viewer', async () => {
			const { env, shared } = await connected()
			const search = async (auth: Record<string, string>) => (await (await call(env, 'GET', '/api/v1/me', undefined, auth)).json()).search
			expect([await search({}), await search(shared), await search({ authorization: '' })]).toEqual([['shop-com'], [], []])
		})
	})
})
