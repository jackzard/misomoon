// Each history entry keeps its own scroll position in history.state, so Back returns to the
// same spot, and a reload keeps it. The browser can't do this itself here: it restores before
// a view's data has loaded, when the page is still too short to scroll that far.

/** Long enough for a slow report; after this, the page stays as far down as it got. */
const RESTORE_MS = 3000
/** How long the page keeps its height before it counts as loaded. */
const SETTLED_MS = 600

let saving: ReturnType<typeof setTimeout> | undefined
let frame = 0
/**
 * Where the visitor last scrolled to. Saving reads this, not scrollY: by then the next view
 * has replaced the page, and the browser has already pulled scrollY up to fit the shorter one.
 */
let last = 0

function stopRestoring() {
	cancelAnimationFrame(frame)
	frame = 0
}

export function saveScroll() {
	clearTimeout(saving)
	// mid-restore the position isn't the visitor's, and the entry already has the right one
	if (!frame) history.replaceState({ ...history.state, scroll: last }, '')
}

/**
 * Scrolls to the current entry's position and holds it until the page stops changing height,
 * or the visitor takes over. Reaching the position isn't enough: as reports above it load,
 * browsers move the page to keep what's on screen in place, which would leave it too far down.
 */
export function restoreScroll() {
	clearTimeout(saving)
	stopRestoring()
	const y: number = history.state?.scroll ?? 0
	const until = performance.now() + RESTORE_MS
	let height = -1
	let since = 0
	const step = () => {
		scrollTo(0, y)
		last = scrollY
		const now = performance.now()
		const h = document.documentElement.scrollHeight
		if (h !== height) {
			height = h
			since = now
		}
		const settled = !y || (scrollY >= y - 1 && now - since >= SETTLED_MS)
		frame = settled || now >= until ? 0 : requestAnimationFrame(step)
	}
	frame = requestAnimationFrame(step)
}

/** Follows the scroll position until the returned function runs. */
export function trackScroll() {
	const off = new AbortController()
	const listen = { passive: true, signal: off.signal }
	history.scrollRestoration = 'manual'
	last = scrollY
	addEventListener(
		'scroll',
		() => {
			if (frame) return
			last = scrollY
			clearTimeout(saving)
			saving = setTimeout(saveScroll, 150)
		},
		listen,
	)
	for (const input of ['wheel', 'touchstart', 'pointerdown', 'keydown']) addEventListener(input, stopRestoring, listen)
	if (history.state?.scroll) restoreScroll()
	return () => {
		off.abort()
		clearTimeout(saving)
		stopRestoring()
	}
}
