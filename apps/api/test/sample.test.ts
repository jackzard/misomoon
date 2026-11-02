import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vite-plus/test'
import { DAY, HOUR, MINUTE, SAMPLE } from '@misomoon/core'
import { invalidate } from '../src/control'
import { fillSample } from '../src/sample'
import { fakeCtx, fakeEnv, type FakeEnv } from './fake'

vi.mock('@misomoon/tracker/m.min.js', () => ({ default: '/* m.js */' }))
const { default: worker } = await import('../src/index')

const NOW = Date.UTC(2026, 9, 22, 18, 3)
const events = (env: FakeEnv) => env.SHARD_0.rows("SELECT COUNT(*) AS n FROM events WHERE site_id = 'acme'")[0].n + env.SHARD_1.rows("SELECT COUNT(*) AS n FROM events WHERE site_id = 'acme'")[0].n
const fill = (env: FakeEnv, now: number, perDay?: number) => fillSample(env as unknown as Env, now, { perDay })

async function get(env: FakeEnv, path: string, headers: Record<string, string> = {}) {
	const res = await worker.fetch(new Request(`https://app.test${path}`, { headers }), env as unknown as Env, fakeCtx() as unknown as ExecutionContext)
	return { status: res.status, body: await res.json<any>() }
}

beforeEach(() => invalidate(''))

describe('the sample site', () => {
	it('does nothing unless SAMPLE_SITE is set', async () => {
		const env = fakeEnv()
		expect(await fill(env, NOW)).toBe(0)
		expect(env.CONTROL.rows("SELECT COUNT(*) AS n FROM sites WHERE id = 'acme'")[0].n).toBe(0)
	})

	it('sets the sample site up whole on the next run when its goals failed to save', async () => {
		const env = fakeEnv({ SAMPLE_SITE: 'acme' })
		const batch = env.CONTROL.batch.bind(env.CONTROL)
		env.CONTROL.batch = async (stmts) => (stmts.some((s) => s.sql.startsWith('INSERT OR IGNORE INTO goals')) ? Promise.reject(new Error('D1 network error')) : batch(stmts))
		await expect(fill(env, NOW, 2)).rejects.toThrow('D1 network error')
		env.CONTROL.batch = batch
		await fill(env, NOW, 2)
		expect(env.CONTROL.rows("SELECT COUNT(*) AS n FROM goals WHERE site_id = 'acme'")[0].n).toBe(SAMPLE.goals.length)
		expect(env.CONTROL.rows("SELECT COUNT(*) AS n FROM funnels WHERE site_id = 'acme'")[0].n).toBe(SAMPLE.funnels.length)
	})

	it('creates a public site with goals and funnels on the sample team, and fills its history a day per run', async () => {
		const env = fakeEnv({ SAMPLE_SITE: 'acme' })
		await fill(env, NOW)
		const site = env.CONTROL.rows("SELECT * FROM sites WHERE id = 'acme'")[0]
		expect([site.name, site.domain, site.team_id, site.public, site.retention_days]).toEqual(['Acme', 'acme.example', 'sample', 1, 90])
		expect(env.CONTROL.rows("SELECT COUNT(*) AS n FROM team_members WHERE team_id = 'sample'")[0].n).toBe(0)
		expect(env.CONTROL.rows("SELECT name FROM goals WHERE site_id = 'acme' ORDER BY name").map((r) => r.name)).toEqual(SAMPLE.goals.map(([n]) => n).sort())
		expect(env.CONTROL.rows("SELECT COUNT(*) AS n FROM funnels WHERE site_id = 'acme'")[0].n).toBe(SAMPLE.funnels.length)
		const first = events(env)
		expect(first).toBeGreaterThan(500)
		const newest = () => Math.max(env.SHARD_0.rows("SELECT MAX(ts) AS t FROM events WHERE site_id = 'acme'")[0].t ?? 0, env.SHARD_1.rows("SELECT MAX(ts) AS t FROM events WHERE site_id = 'acme'")[0].t ?? 0)
		// the first run writes the oldest day only
		expect(newest()).toBeLessThan(NOW - (SAMPLE.days - 1) * DAY)
		await fill(env, NOW)
		expect(events(env)).toBeGreaterThan(first)
		expect(newest()).toBeLessThan(NOW - (SAMPLE.days - 2) * DAY)
	})

	it('tops up to now without storing a hit twice', async () => {
		// the stats read below asks for the last 7 days of the clock, so it has to be NOW's clock
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(NOW)
		onTestFinished(() => void vi.useRealTimers())
		const env = fakeEnv({ SAMPLE_SITE: 'acme' })
		// a small store, so the whole history fills quickly on every database. A run moves on
		// from the newest stored hit, so quiet hours make it cover a little less than a day.
		let filled = -1
		for (let i = 0; i < 2 * SAMPLE.days && events(env) !== filled; i++) {
			filled = events(env)
			await fill(env, NOW, 40)
		}
		expect(events(env)).toBe(filled)
		// the run starts at the newest stored hit, which inserts nothing again
		await fill(env, NOW, 40)
		expect(events(env)).toBe(filled)
		// five minutes later a run adds what is new, and below no hit is stored twice
		await fill(env, NOW + 5 * MINUTE, 40)
		expect(events(env)).toBeGreaterThanOrEqual(filled)
		const ids = (db: FakeEnv['SHARD_0']) => db.rows("SELECT event_id FROM events WHERE site_id = 'acme'").map((r) => r.event_id)
		const all = [...ids(env.SHARD_0), ...ids(env.SHARD_1)]
		expect(new Set(all).size).toBe(all.length)
		// the dashboard reads it signed out, and it has people on it now
		const live = await get(env, '/api/v1/stats/aggregate?site=acme&period=7d')
		expect(live.status).toBe(200)
		expect(live.body.current.visitors).toBeGreaterThan(50)
		expect(live.body.current.revenue).toBeGreaterThan(0)
		const me = await get(env, '/api/v1/me')
		expect(me.body.sample).toBe('acme')
		expect(me.body.sites.map((s: { id: string }) => s.id)).toContain('acme')
	}, 60_000)

	it('writes the minutes since the last run when someone watches Live, once its history is in', async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(NOW)
		try {
			const env = fakeEnv({ SAMPLE_SITE: 'acme' })
			const live = async () => {
				const ctx = fakeCtx()
				const res = await worker.fetch(new Request('https://app.test/api/v1/stats/realtime?site=acme'), env as unknown as Env, ctx as unknown as ExecutionContext)
				await ctx.settle()
				return res.json<{ visitors: number }>()
			}
			// still filling its history: Live leaves that to the cron
			await fill(env, NOW, 40)
			const filling = events(env)
			await live()
			expect(events(env)).toBe(filling)
			// caught up to five minutes ago, as just before the next run
			for (const db of [env.SHARD_0, env.SHARD_1]) db.db.exec(`UPDATE events SET ts = ${NOW - 5 * MINUTE} WHERE rowid = (SELECT MAX(rowid) FROM events WHERE site_id = 'acme')`)
			vi.setSystemTime(NOW + 30_000)
			await live()
			expect(events(env)).toBeGreaterThan(filling)
			expect((await live()).visitors).toBeGreaterThanOrEqual(SAMPLE.online)
		} finally {
			vi.useRealTimers()
		}
	})

	it('never writes to a site with the same id that another team owns', async () => {
		const env = fakeEnv({ SAMPLE_SITE: 'acme' })
		await worker.fetch(
			new Request('https://app.test/api/v1/sites', { method: 'POST', headers: { authorization: 'Bearer ms_owner-session', 'content-type': 'application/json' }, body: JSON.stringify({ id: 'acme', domain: 'acme.com' }) }),
			env as unknown as Env,
			fakeCtx() as unknown as ExecutionContext,
		)
		expect(await fill(env, NOW - HOUR)).toBe(0)
		expect(events(env)).toBe(0)
	})
})
