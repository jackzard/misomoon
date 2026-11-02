<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'
	import ArrowRight from '@lucide/svelte/icons/arrow-right'
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
	import X from '@lucide/svelte/icons/x'
	import Topbar from '../components/Topbar.svelte'
	import { get, type Journey } from '../lib/api'
	import { getDash } from '../lib/dash.svelte'
	import { num, pct } from '../lib/format'
	import { journeyUrls } from '../lib/journeys'

	const dash = getDash()
	const direction = $derived(dash.direction)
	/** the chosen pages, in the order they were picked */
	const picked = $derived(dash.steps)
	let columns = $state.raw<(Journey | null)[]>([])
	let error = $state<string | null>(null)
	// not reactive: the last answers by URL
	let shown = new Map<string, Journey>()

	const END = new Set(['(exit)', '(entrance)'])

	$effect(() => {
		const urls = journeyUrls(dash.params, direction, picked, dash.tick)
		error = null
		let stale = false
		// keep the columns whose question didn't change while the rest load
		const prev = shown
		columns = urls.map((u) => prev.get(u) ?? null)
		Promise.all(urls.map((u) => get<Journey>(u)))
			.then((res) => {
				if (stale) return
				columns = res
				shown = new Map(urls.map((u, k) => [u, res[k]]))
			})
			.catch((e) => !stale && (error = (e as Error).message))
		return () => (stale = true)
	})

	function choose(k: number, key: string) {
		if (END.has(key) || picked.length >= 6) return
		dash.steps = [...picked.slice(0, k), key]
	}

	/** Drops the nth pick and the ones after it: each step only means something after the steps before it. */
	function drop(n: number) {
		dash.steps = picked.slice(0, n)
	}

	function flip(dir: 'forward' | 'backward') {
		dash.direction = dir
		dash.steps = []
	}

	const trail = $derived(direction === 'forward' ? picked : [...picked].reverse())
	const lastJourney = $derived(columns[picked.length] ?? null)
</script>

<Topbar title="Paths" subtitle="Pick a page and see where people went next, step by step." />

<div class="tools">
	<div class="group" role="tablist" aria-label="Direction">
		<button role="tab" aria-selected={direction === 'forward'} class:on={direction === 'forward'} onclick={() => flip('forward')}><ArrowRight size={13} /> Where they go next</button>
		<button role="tab" aria-selected={direction === 'backward'} class:on={direction === 'backward'} onclick={() => flip('backward')}><ArrowLeft size={13} /> How they got there</button>
	</div>
	{#if picked.length}
		<div class="trail">
			{#if direction === 'backward'}<span class="muted">…</span>{/if}
			{#each trail as p, i (i)}
				{@const n = direction === 'forward' ? i : trail.length - 1 - i}
				<span class="crumb">
					{p}
					<button onclick={() => drop(n)} aria-label="Remove {p}{n < picked.length - 1 ? ' and the steps after it' : ''}" title={n < picked.length - 1 ? 'Remove this step and the ones after it' : 'Remove this step'}><X size={12} /></button>
				</span>
				{#if i < trail.length - 1}<span class="arrow">→</span>{/if}
			{/each}
			{#if direction === 'forward'}<span class="muted">→ …</span>{/if}
			{#if lastJourney}<span class="muted small">{num(lastJourney.visitors)} visitors</span>{/if}
			<button class="btn ghost" onclick={() => (dash.steps = [])}><RotateCcw size={13} /> Start over</button>
		</div>
	{/if}
</div>

{#if error}<p class="muted">{error}</p>{/if}

<div class="columns">
	{#each columns as col, k (k)}
		<section class="card col" class:last={k === columns.length - 1}>
			<header>
				<div class="titles">
					<span class="step num">{direction === 'forward' ? `Step ${k + 1}` : k === 0 ? 'Last page' : `${k} back`}</span>
					<h3>{k === 0 ? (direction === 'forward' ? 'Entry pages' : 'Exit pages') : direction === 'forward' ? `After ${picked[k - 1]}` : `Before ${picked[k - 1]}`}</h3>
				</div>
				<!-- the first column has nothing picked to remove -->
				{#if k > 0}
					<button class="close" onclick={() => drop(k - 1)} aria-label="Remove {picked[k - 1]}{k < picked.length ? ' and the steps after it' : ''}" title={k < picked.length ? 'Remove this step and the ones after it' : 'Remove this step'}><X size={14} /></button>
				{/if}
			</header>
			{#if !col && error}
				<p class="muted empty">This step didn't load.</p>
			{:else if !col}
				{#each Array(5) as _, i (i)}<div class="row sk"><span class="skeleton" style="width: {85 - i * 12}%; height: 14px"></span></div>{/each}
			{:else if !col.steps.length}
				<p class="muted empty">Nobody went further in this period.</p>
			{:else}
				<ul>
					{#each col.steps as s (s.key)}
						{@const on = picked[k] === s.key}
						<li>
							<button class="row" class:on class:end={END.has(s.key)} disabled={END.has(s.key)} onclick={() => choose(k, s.key)}>
								<span class="bar" style:width="{s.share}%"></span>
								<span class="key">{s.key}</span>
								<span class="pct num">{pct(s.share, 0)}</span>
								<span class="v num">{num(s.visitors)}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</div>

<style>
	.tools {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
		margin-top: 20px;
	}
	.trail {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		font-size: 13px;
	}
	.crumb {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-mono);
		font-size: 12px;
		padding: 2px 2px 2px 8px;
		border-radius: var(--radius-sm);
		background: var(--miso-soft);
		border: 1px solid var(--miso-line);
	}
	.crumb button {
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: var(--radius-xs);
		color: var(--text-3);
	}
	.crumb button:hover {
		background: var(--surface-3);
		color: var(--text);
	}
	.arrow {
		color: var(--miso);
		font-weight: 700;
	}
	.small {
		font-size: 12px;
		margin-left: 6px;
	}
	.columns {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		padding: 18px 6px 12px 0;
		scroll-snap-type: x proximity;
	}
	.col {
		flex: 0 0 300px;
		padding: 14px 14px 10px;
		scroll-snap-align: start;
	}
	header {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin-bottom: 10px;
	}
	.titles {
		flex: 1;
		min-width: 0;
	}
	.close {
		display: grid;
		place-items: center;
		flex: none;
		width: 28px;
		height: 28px;
		margin: -4px -4px 0 0;
		border-radius: var(--radius-sm);
		color: var(--text-3);
	}
	.close:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
	.step {
		font-size: 10.5px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--miso);
		font-weight: 600;
	}
	h3 {
		margin: 4px 0 0;
		font-size: 14px;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		height: 32px;
		padding: 0 8px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		text-align: left;
		overflow: hidden;
	}
	.row:not(:disabled):hover {
		background: var(--surface-hover);
	}
	.bar {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--dots);
		box-shadow: inset 0 -2px 0 var(--miso);
		transition: width var(--dur-slow) var(--ease-out);
	}
	.row.on {
		outline: 2px solid var(--edge);
		box-shadow: 3px 3px 0 var(--edge);
	}
	/* the selected style sets its own shadow, so the focus ring is added back on top of it */
	.row.on:focus-visible {
		box-shadow:
			3px 3px 0 var(--edge),
			var(--focus);
	}
	.row.on .bar {
		background: var(--miso-line);
	}
	.row.on .key {
		font-weight: 600;
	}
	.row.end .key {
		color: var(--text-3);
		font-style: italic;
	}
	.key {
		position: relative;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: var(--font-mono);
		font-size: 12px;
	}
	.pct {
		position: relative;
		color: var(--text-3);
		font-size: 12px;
	}
	.v {
		position: relative;
		width: 48px;
		text-align: right;
		font-weight: 600;
	}
	.sk {
		pointer-events: none;
	}
	.empty {
		font-size: 13px;
		padding: 8px;
	}
</style>
