// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const { restoreScroll, saveScroll, trackScroll } = await import('../src/lib/scroll')

/** A page that's `height` tall, as far as scrolling goes. */
let height = 0
let y = 0
let frames: (() => void)[] = []
let stop: (() => void) | undefined
let now = 0
const frame = () => frames.shift()?.()
const history = { state: null as { scroll?: number } | null, scrollRestoration: 'auto', replaceState: (s: { scroll?: number }) => (history.state = s) }

beforeEach(() => {
	height = 0
	y = 0
	frames = []
	now = 0
	history.state = null
	vi.spyOn(performance, 'now').mockImplementation(() => now)
	vi.stubGlobal('history', history)
	vi.stubGlobal('scrollTo', (_: number, to: number) => (y = Math.min(to, height)))
	vi.spyOn(globalThis, 'scrollY', 'get').mockImplementation(() => y)
	vi.stubGlobal('requestAnimationFrame', (f: () => void) => frames.push(f))
	vi.stubGlobal('cancelAnimationFrame', () => (frames = []))
})
afterEach(() => {
	stop?.()
	stop = undefined
	// finish any restore, whose state outlives the test
	history.state = null
	restoreScroll()
	frame()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('restoring the scroll position', () => {
	it('keeps trying as the page grows, then stops once its height holds', () => {
		history.state = { scroll: 500 }
		restoreScroll()
		frame()
		expect(y).toBe(0)
		height = 300
		frame()
		expect(y).toBe(300)
		height = 2000
		frame()
		expect(y).toBe(500)
		expect(frames).toHaveLength(1)
		now = 601
		frame()
		expect(frames).toHaveLength(0)
	})

	it('holds the position while reports load above it and the browser moves the page', () => {
		height = 2000
		let pageHeight = 2000
		vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockImplementation(() => pageHeight)
		history.state = { scroll: 500 }
		restoreScroll()
		frame()
		expect(y).toBe(500)
		// a report above loads: the page is taller and the browser keeps what's on screen in place
		now = 500
		pageHeight = 2072
		y = 572
		frame()
		expect(y).toBe(500)
		// 500ms after the page last grew isn't settled yet, 600ms is
		now = 1000
		frame()
		expect(frames).toHaveLength(1)
		now = 1101
		frame()
		expect(frames).toHaveLength(0)
		expect(y).toBe(500)
	})

	it('gives up on a page that never gets that tall', () => {
		history.state = { scroll: 500 }
		restoreScroll()
		frame()
		expect(frames).toHaveLength(1)
		now = 3001
		frame()
		expect(frames).toHaveLength(0)
	})

	it('stops at once at the top of the page', () => {
		height = 2000
		restoreScroll()
		frame()
		expect(frames).toHaveLength(0)
	})

	it('goes to the top for an entry with no position', () => {
		height = 2000
		y = 900
		restoreScroll()
		frame()
		expect(y).toBe(0)
	})

	it('does not save a position it is still scrolling to', () => {
		history.state = { scroll: 500 }
		restoreScroll()
		y = 100
		saveScroll()
		expect(history.state).toEqual({ scroll: 500 })
	})

	it('saves into the entry, keeping what else it holds', () => {
		stop = trackScroll()
		history.state = { other: 1 } as never
		y = 240
		dispatchEvent(new Event('scroll'))
		saveScroll()
		expect(history.state).toEqual({ other: 1, scroll: 240 })
	})

	it('saves where the visitor was, not where a shorter next view has pulled the page', () => {
		stop = trackScroll()
		y = 1700
		dispatchEvent(new Event('scroll'))
		// the next view is on the page, and its scroll event hasn't fired yet
		y = 0
		saveScroll()
		expect(history.state).toEqual({ scroll: 1700 })
	})

	it('saves shortly after the visitor stops scrolling', () => {
		vi.useFakeTimers()
		stop = trackScroll()
		y = 300
		dispatchEvent(new Event('scroll'))
		expect(history.state).toBe(null)
		vi.advanceTimersByTime(200)
		expect(history.state).toEqual({ scroll: 300 })
		vi.useRealTimers()
	})

	it('stops when the visitor takes over, and goes back on a reload', () => {
		history.state = { scroll: 500 }
		stop = trackScroll()
		expect(history.scrollRestoration).toBe('manual')
		expect(frames).toHaveLength(1)
		dispatchEvent(new Event('wheel'))
		expect(frames).toHaveLength(0)
		restoreScroll()
		expect(frames).toHaveLength(1)
		dispatchEvent(new Event('pointerdown'))
		expect(frames).toHaveLength(0)
	})

	it('stops following once told to', () => {
		vi.useFakeTimers()
		trackScroll()()
		y = 300
		dispatchEvent(new Event('scroll'))
		vi.advanceTimersByTime(200)
		expect(history.state).toBe(null)
		vi.useRealTimers()
	})
})
