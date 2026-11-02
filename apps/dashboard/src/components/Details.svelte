<script lang="ts">
	import Search from '@lucide/svelte/icons/search'
	import X from '@lucide/svelte/icons/x'
	import { get, type BreakdownResponse, type Row } from '../lib/api'
	import { getDash } from '../lib/dash.svelte'
	import { duration, money, num, pct } from '../lib/format'
	import { displayKey, favicon, iconDomain, prefix } from '../lib/labels'
	import { appendRows, sortRows } from '../lib/rows'
	import type { PanelTab } from './Panel.svelte'

	let { tab, title }: { tab: PanelTab; title: string } = $props()
	const dash = getDash()

	type Col = { key: keyof Row; label: string; fmt: (v: number) => string }
	const columns = $derived.by((): Col[] => {
		const p = tab.property
		if (p === 'search_term') {
			return [
				{ key: 'clicks', label: 'Clicks', fmt: num },
				{ key: 'impressions', label: 'Impressions', fmt: num },
				{ key: 'ctr', label: 'CTR', fmt: (v) => pct(v) },
				{ key: 'position', label: 'Position', fmt: (v) => v.toFixed(1) },
			]
		}
		if (p === 'page') {
			return [
				{ key: 'visitors', label: 'People', fmt: num },
				{ key: 'pageviews', label: 'Pageviews', fmt: num },
				{ key: 'bounce_rate', label: 'Left at once', fmt: (v) => pct(v) },
				{ key: 'time_on_page', label: 'Time on page', fmt: duration },
				{ key: 'scroll_depth', label: 'Read', fmt: (v) => pct(v, 0) },
			]
		}
		if (p === 'event' || p === 'goal' || p.startsWith('prop:')) {
			return [
				{ key: 'visitors', label: 'People', fmt: num },
				{ key: 'events', label: 'Times', fmt: num },
				{ key: 'conversion_rate', label: 'Rate', fmt: (v) => pct(v) },
				{ key: 'revenue', label: 'Revenue', fmt: (v) => (v ? money(v, dash.current?.currency) : '—') },
				{ key: 'average_revenue', label: 'Avg revenue', fmt: (v) => (v ? money(v, dash.current?.currency) : '—') },
			]
		}
		if (p === 'exit_page') {
			return [
				{ key: 'visitors', label: 'People', fmt: num },
				{ key: 'visits', label: 'Visits ended', fmt: num },
				{ key: 'exit_rate', label: 'Exit rate', fmt: (v) => (v == null ? '—' : pct(v)) },
			]
		}
		if (p === 'entry_page') {
			return [
				{ key: 'visitors', label: 'People', fmt: num },
				{ key: 'visits', label: 'Visits started', fmt: num },
				{ key: 'bounce_rate', label: 'Left at once', fmt: (v) => pct(v) },
				{ key: 'visit_duration', label: 'Time per visit', fmt: duration },
			]
		}
		return [
			{ key: 'visitors', label: 'People', fmt: num },
			{ key: 'visits', label: 'Visits', fmt: num },
			{ key: 'pageviews', label: 'Pageviews', fmt: num },
			{ key: 'bounce_rate', label: 'Left at once', fmt: (v) => pct(v) },
			{ key: 'visit_duration', label: 'Time per visit', fmt: duration },
			// payments credited to the source, country or device that brought the buyer
			...(rows.some((r) => r.revenue)
				? [{ key: 'revenue' as const, label: 'Revenue', fmt: (v: number) => (v ? money(v, dash.current?.currency) : '—') }]
				: []),
		]
	})

	let search = $state('')
	let rows = $state.raw<Row[]>([])
	let page = $state(1)
	let hasMore = $state(false)
	let loading = $state(false)
	let error = $state<string | null>(null)
	let sortKey = $state<keyof Row>('visitors')
	let sortDir = $state<1 | -1>(-1)

	// Only the latest request may write: a new search aborts the one before it,
	// so an older, slower answer cannot replace a newer one or append to it.
	let ctrl: AbortController | null = null
	async function load(reset: boolean) {
		ctrl?.abort()
		const mine = (ctrl = new AbortController())
		loading = true
		error = null
		const p = reset ? 1 : page + 1
		const url = `/api/v1/stats/breakdown?${dash.params}&property=${encodeURIComponent(tab.property)}&limit=50&page=${p}${search ? `&search=${encodeURIComponent(search)}` : ''}`
		try {
			const res = await get<BreakdownResponse>(url, mine.signal)
			if (mine.signal.aborted) return
			rows = reset ? res.rows : appendRows(rows, res.rows)
			hasMore = res.has_more
			page = p
		} catch (e) {
			if (mine.signal.aborted) return
			error = (e as Error).message
			if (reset) rows = []
		} finally {
			if (!mine.signal.aborted) loading = false
		}
	}
	$effect(() => () => ctrl?.abort())

	let timer: ReturnType<typeof setTimeout>
	$effect(() => {
		void search
		void dash.params
		clearTimeout(timer)
		timer = setTimeout(() => load(true), search ? 220 : 0)
	})

	const sorted = $derived(sortRows(rows, sortKey, sortDir))
	const filterDim = $derived(tab.filter === undefined ? tab.property : tab.filter)

	function sortBy(k: keyof Row) {
		if (sortKey === k) sortDir = sortDir === 1 ? -1 : 1
		else {
			sortKey = k
			sortDir = -1
		}
	}

	let input: HTMLInputElement | undefined = $state()
	$effect(() => input?.focus())
	// gone because the view changed (the palette, a shortcut): coming back shouldn't reopen it
	const mine = dash.details
	$effect(() => () => {
		if (dash.details === mine) dash.details = null
	})
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && dash.closeDetails()} />

<div class="scrim" onclick={() => dash.closeDetails()} role="presentation"></div>
<div class="modal card" role="dialog" aria-modal="true" aria-label={title}>
	<header>
		<h2 class="serif">{title}</h2>
		<label class="search">
			<Search size={14} />
			<input bind:this={input} bind:value={search} aria-label="Search {title.toLowerCase()}" placeholder="Search {title.toLowerCase()}…" />
		</label>
		<button class="btn icon ghost" onclick={() => dash.closeDetails()} aria-label="Close"><X size={16} /></button>
	</header>
	<div class="table scroll-thin">
		<table>
			<thead>
				<tr>
					<th class="k">{title}</th>
					{#each columns as c (c.key)}
						<th>
							<button onclick={() => sortBy(c.key)} class:on={sortKey === c.key}>
								{c.label}{sortKey === c.key ? (sortDir === -1 ? ' ↓' : ' ↑') : ''}
							</button>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if loading && !rows.length && !error}
					{#each Array(8) as _, i (i)}
						<tr class="sk">
							<td class="k"><span class="skeleton" style="width: {70 - (i % 4) * 12}%"></span></td>
							{#each columns as c (c.key)}<td><span class="skeleton"></span></td>{/each}
						</tr>
					{/each}
				{/if}
				{#each sorted as row (row.key)}
					{@const domain = iconDomain(tab.property, row.key)}
					{@const pre = prefix(tab.property, row.key)}
					{@const target = tab.filterFor ? tab.filterFor(row.key) : filterDim ? ([filterDim, row.key] as const) : null}
					<tr
						class:clickable={!!target}
						tabindex={target ? 0 : undefined}
						title={target ? `Filter by ${displayKey(tab.property, row.key)}` : undefined}
						onclick={() => {
							if (!target) return
							dash.toggleFilter(target[0], target[1])
							dash.details = null
						}}
						onkeydown={(e) => {
							if (!target || (e.key !== 'Enter' && e.key !== ' ')) return
							e.preventDefault()
							dash.toggleFilter(target[0], target[1])
							dash.details = null
						}}
					>
						<td class="k">
							{#if domain}<img src={favicon(domain)} alt="" width="14" height="14" loading="lazy" />{:else if pre}<span>{pre}</span>{/if}
							<span class="t">{displayKey(tab.property, row.key)}</span>
						</td>
						{#each columns as c (c.key)}
							<td class="num">{row[c.key] == null ? '—' : c.fmt(row[c.key] as number)}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
		{#if error}<p class="empty">Couldn't load: {error}</p>{:else if !loading && !rows.length}<p class="empty">No matches.</p>{/if}
	</div>
	<footer>
		<span class="muted">{rows.length} rows</span>
		{#if hasMore}<button class="btn" onclick={() => load(false)} disabled={loading}>{loading ? 'Loading…' : 'Load more'}</button>{/if}
	</footer>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		background:
			radial-gradient(circle, rgb(23 20 15 / 0.2) 1px, transparent 1.4px) 0 0 / 5px 5px,
			rgb(23 20 15 / 0.16);
		z-index: 50;
		animation: fade var(--dur) var(--ease-out);
	}
	.modal {
		position: fixed;
		left: 50%;
		top: 8vh;
		transform: translateX(-50%);
		width: min(960px, calc(100vw - 32px));
		max-height: 84vh;
		display: flex;
		flex-direction: column;
		z-index: 51;
		box-shadow: var(--shadow-lg);
		animation: rise var(--dur) var(--ease-out);
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translate(-50%, 8px) scale(0.99);
		}
	}
	header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 16px 12px 22px;
		border-bottom: 1px solid var(--line);
	}
	h2 {
		margin: 0;
		font-size: 26px;
		flex: 1;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 34px;
		padding: 0 12px;
		width: 280px;
		border-radius: var(--radius);
		border: 1px solid var(--line-strong);
		background: var(--surface-2);
		color: var(--text-3);
	}
	.search input {
		border: 0;
		outline: 0;
		background: none;
		flex: 1;
		color: var(--text);
		box-shadow: none;
	}
	.table {
		overflow: auto;
		padding: 0 10px;
	}
	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		font-size: 13px;
	}
	th {
		position: sticky;
		top: 0;
		background: var(--surface);
		text-align: right;
		font-weight: 500;
		font-size: 11.5px;
		color: var(--text-3);
		padding: 12px 12px 8px;
		white-space: nowrap;
	}
	th button.on {
		color: var(--text);
	}
	th.k,
	td.k {
		text-align: left;
	}
	td {
		padding: 9px 12px;
		text-align: right;
		border-top: 1px solid var(--line);
		color: var(--text-2);
	}
	.sk .skeleton {
		height: 12px;
		margin: 3px 0;
	}
	.sk td:not(.k) .skeleton {
		width: 40px;
		margin-left: auto;
	}
	td.k {
		display: flex;
		align-items: center;
		gap: 9px;
		color: var(--text);
		max-width: 420px;
	}
	.t {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	tr.clickable {
		cursor: pointer;
	}
	tr.clickable:focus-visible {
		outline: 2px solid var(--miso);
		outline-offset: -2px;
	}
	tr.clickable:hover td,
	tr.clickable:focus-visible td {
		background: var(--surface-hover);
	}
	.empty {
		text-align: center;
		color: var(--text-3);
		padding: 40px 0;
	}
	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 22px;
		border-top: 1px solid var(--line);
		font-size: 12px;
	}
</style>
