<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus'
	import Trash from '@lucide/svelte/icons/trash-2'
	import { untrack } from 'svelte'
	import Select from '../components/Select.svelte'
	import Topbar from '../components/Topbar.svelte'
	import { send, type Funnel, type FunnelMode, type FunnelResult, type FunnelStep } from '../lib/api'
	import { getDash, Resource } from '../lib/dash.svelte'
	import { num, pct } from '../lib/format'

	const dash = getDash()
	const saved = new Resource<Funnel[]>(() => (dash.site ? `/api/v1/sites/${dash.site}/funnels?_=${dash.tick}` : null))

	let steps = $state<FunnelStep[]>([])
	let name = $state('')
	let mode = $state<FunnelMode>('sequential')
	const STEP_KINDS: { value: FunnelStep['kind']; label: string }[] = [
		{ value: 'page', label: 'Visits page' },
		{ value: 'event', label: 'Triggers event' },
	]
	const MODES: { key: FunnelMode; label: string; hint: string }[] = [
		{ key: 'sequential', label: 'Sequential', hint: 'Steps in order, other pages and events allowed in between.' },
		{ key: 'strict', label: 'Strict', hint: 'Steps in order with nothing in between.' },
		{ key: 'flexible', label: 'Flexible', hint: 'Middle steps in order; the last step counts anyone who reached it after the first.' },
	]
	const selected = $derived(dash.funnel === 'new' ? null : dash.funnel)
	let result = $state.raw<FunnelResult | null>(null)
	let error = $state<string | null>(null)
	let running = $state(false)
	let saving = $state(false)
	let saveError = $state<string | null>(null)

	// The builder opens what the URL names, which Back and Forward can change. Refreshing the
	// saved list must not swap the steps being edited, so a value opens once. A funnel that's
	// gone, or none named, opens the first saved one, in the same history entry.
	let shown: string | null | undefined
	$effect(() => {
		const list = saved.data
		const want = dash.funnel
		if (!list || want === shown) return
		untrack(() => {
			if (want === 'new') return blank()
			// steps added while the list loaded stay
			if (!want && steps.length) return void (shown = null)
			const f = list.find((x) => x.id === want) ?? list[0]
			if (f) open(f)
			else {
				name = ''
				steps = []
				dash.funnel = shown = null
			}
			dash.syncUrl(true)
		})
	})

	function open(f: Funnel) {
		saveError = null
		dash.funnel = shown = f.id
		name = f.name
		mode = f.mode ?? 'sequential'
		steps = f.steps.map((s) => ({ ...s }))
	}

	function blank() {
		saveError = null
		dash.funnel = shown = 'new'
		name = ''
		mode = 'sequential'
		steps = [
			{ kind: 'page', match: '/' },
			{ kind: 'page', match: '/pricing' },
		]
	}

	const valid = $derived(steps.length >= 2 && steps.every((s) => s.match.trim()))
	const hint = $derived.by(() => {
		if (steps.length < 2) return 'Add at least two steps to save.'
		const k = steps.findIndex((s) => !s.match.trim())
		return k === -1 ? null : `Fill in step ${k + 1} to save.`
	})

	// Re-run whenever the steps, period or filters change.
	$effect(() => {
		const body = { site: dash.site, ...Object.fromEntries(new URLSearchParams(dash.params)), steps: $state.snapshot(steps), mode }
		void dash.tick
		if (!valid || !dash.site) {
			result = null
			return
		}
		// Each run supersedes the last: a slow answer for older steps is dropped.
		let stale = false
		running = true
		const t = setTimeout(async () => {
			try {
				const r = await send<FunnelResult>('POST', '/api/v1/stats/funnel', body)
				if (stale) return
				result = r
				error = null
			} catch (e) {
				if (!stale) error = (e as Error).message
			} finally {
				if (!stale) running = false
			}
		}, 250)
		return () => {
			stale = true
			clearTimeout(t)
		}
	})

	// Saving an open funnel updates it; only a new one is created.
	async function save() {
		if (!dash.site || !valid || saving) return
		saving = true
		saveError = null
		try {
			const body = { name: name.trim() || 'Untitled funnel', steps: $state.snapshot(steps), mode }
			const f = selected
				? await send<Funnel>('PUT', `/api/v1/sites/${dash.site}/funnels/${selected}`, body)
				: await send<Funnel>('POST', `/api/v1/sites/${dash.site}/funnels`, body)
			dash.funnel = shown = f.id
			dash.syncUrl(true)
			dash.tick++
		} catch (e) {
			saveError = (e as Error).message
		} finally {
			saving = false
		}
	}

	let confirmDelete = $state(false)
	async function remove() {
		if (!dash.site || !selected || saving) return
		if (!confirmDelete) return void (confirmDelete = true)
		confirmDelete = false
		saving = true
		saveError = null
		try {
			await send('DELETE', `/api/v1/sites/${dash.site}/funnels/${selected}`)
			blank()
			dash.syncUrl(true)
			dash.tick++
		} catch (e) {
			saveError = (e as Error).message
		} finally {
			saving = false
		}
	}

	const top = $derived(Math.max(1, result?.steps[0]?.visitors ?? 1))
</script>

<Topbar title="Funnels" subtitle="Line up the steps you care about and see where people drop out." />

<div class="layout">
	<aside class="card list">
		<div class="list-head">
			<h3>Saved</h3>
			<button class="btn ghost icon" onclick={blank} aria-label="New funnel"><Plus size={15} /></button>
		</div>
		{#if saved.error}
			<p class="muted small">Couldn't load saved funnels: {saved.error}</p>
		{:else if !saved.data}
			{#each Array(3) as _, i (i)}<div class="item sk"><span class="skeleton" style="width: {70 - i * 15}%"></span><span class="skeleton" style="width: 34%"></span></div>{/each}
		{/if}
		{#each saved.data ?? [] as f (f.id)}
			<button class="item" class:on={selected === f.id} onclick={() => open(f)}>
				<span>{f.name}</span>
				<span class="muted num">{f.steps.length} steps</span>
			</button>
		{:else}
			{#if saved.data}<p class="muted small">No saved funnels yet.</p>{/if}
		{/each}
	</aside>

	<section class="card main">
		<div class="builder">
			<input class="input title" aria-label="Funnel name" placeholder="Funnel name" bind:value={name} />
			<label class="mode">
				<Select label="Funnel type" bind:value={mode} options={MODES.map((m) => ({ value: m.key, label: m.label }))} />
				<span class="muted small">{MODES.find((m) => m.key === mode)?.hint}</span>
			</label>
			<ol>
				{#each steps as step, i (i)}
					<li>
						<span class="n num">{i + 1}</span>
						<Select label="Step {i + 1} type" class="kind" bind:value={step.kind} options={STEP_KINDS} />
						<input class="input match" aria-label="Step {i + 1} {step.kind === 'page' ? 'path' : 'event name'}" placeholder={step.kind === 'page' ? '/path or /blog/*' : 'Event name'} bind:value={step.match} />
						<button class="btn ghost icon" onclick={() => steps.splice(i, 1)} aria-label="Remove step {i + 1}"><Trash size={14} /></button>
					</li>
				{/each}
			</ol>
			<div class="actions">
				<button class="btn" onclick={() => steps.push({ kind: 'page', match: '' })} disabled={steps.length >= 8} title={steps.length >= 8 ? 'A funnel holds up to 8 steps' : undefined}><Plus size={14} /> Add step</button>
				{#if dash.canEdit}
					<button class="btn primary" onclick={save} disabled={!valid || saving}>{selected ? 'Save changes' : 'Save funnel'}</button>
					{#if selected}
						<button class="btn ghost" onclick={remove} disabled={saving}>{confirmDelete ? 'Click again to delete' : 'Delete'}</button>
						{#if confirmDelete}<button class="btn ghost" onclick={() => (confirmDelete = false)}>Keep it</button>{/if}
					{/if}
					{#if hint}<span class="muted small hint">{hint}</span>{/if}
				{/if}
			</div>
			{#if saveError}<p class="save-error" role="alert">{saveError}</p>{/if}
		</div>

		<div class="viz" class:stale={running}>
			{#if error}
				<p class="muted">{error}</p>
			{:else if result}
				<div class="summary">
					<div>
						<span class="muted">Converted</span>
						<strong class="num">{pct(result.steps.at(-1)?.conversion ?? 0)}</strong>
					</div>
					<div>
						<span class="muted">Completed</span>
						<strong class="num">{num(result.completed)}</strong>
					</div>
					<div>
						<span class="muted">Of all visitors</span>
						<strong class="num">{pct(result.entered ? (result.completed / result.entered) * 100 : 0)}</strong>
					</div>
				</div>
				<div class="steps" style:--n={result.steps.length}>
					{#each result.steps as s, i (i)}
						<div class="col">
							<div class="track">
								<div class="drop" style:height="{((result.steps[Math.max(0, i - 1)].visitors) / top) * 100}%"></div>
								<div class="fill" style:height="{(s.visitors / top) * 100}%"></div>
								<span class="pct num" class:inside={s.visitors / top > 0.18} style:bottom="{(s.visitors / top) * 100}%">{pct(s.conversion, 0)}</span>
							</div>
							<div class="label">
								<span class="step-n num">Step {i + 1}</span>
								<strong>{s.label}</strong>
								<span class="num">{num(s.visitors)} visitors</span>
								{#if i > 0 && s.dropoff > 0}
									<span class="lost num">−{num(s.dropoff)} dropped</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="muted">Add at least two steps to see the funnel.</p>
			{/if}
		</div>
	</section>
</div>

<style>
	.save-error {
		margin: 8px 0 0;
		font-size: 13px;
		color: var(--bad);
	}
	.layout {
		display: grid;
		grid-template-columns: 240px minmax(0, 1fr);
		gap: 16px;
		margin-top: 20px;
	}
	.list {
		padding: 12px 8px;
		align-self: start;
	}
	.list-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 6px 8px;
	}
	h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
	}
	.item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		padding: 9px 10px;
		border-radius: var(--radius);
		font-size: 13px;
		gap: 2px;
	}
	.item.sk .skeleton {
		height: 11px;
		margin: 2px 0;
	}
	.item .muted {
		font-size: 11.5px;
	}
	.item:hover {
		background: var(--surface-hover);
	}
	.item.on {
		background: var(--surface-3);
	}
	.small {
		font-size: 12.5px;
		padding: 6px;
	}
	.main {
		padding: 20px 22px 24px;
	}
	.title {
		width: 100%;
		font-size: 15px;
		font-weight: 500;
		height: 38px;
	}
	.mode {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 10px;
	}
	.mode :global(.select) {
		width: 140px;
	}
	.mode .small {
		padding: 0;
	}
	ol {
		list-style: none;
		padding: 0;
		margin: 12px 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.n {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--miso-soft);
		color: var(--miso);
		font-size: 12px;
		flex: none;
	}
	li > :global(.select.kind) {
		flex: 0 1 150px;
		min-width: 116px;
	}
	.match {
		flex: 1;
		min-width: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.hint {
		align-self: center;
		padding: 0;
	}
	.viz {
		margin-top: 26px;
		padding-top: 22px;
		border-top: 1px solid var(--line);
		transition: opacity var(--dur);
	}
	.viz.stale {
		opacity: 0.6;
	}
	.summary {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 36px;
		margin-bottom: 22px;
	}
	.summary div {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 12px;
	}
	.summary span {
		font-weight: 600;
	}
	.summary strong {
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.03em;
	}
	.steps {
		display: grid;
		grid-template-columns: repeat(var(--n), minmax(0, 1fr));
		gap: 10px;
	}
	.track {
		position: relative;
		height: 240px;
		border: 1.5px solid var(--edge);
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		overflow: hidden;
	}
	.drop,
	.fill {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		transition: height var(--dur-slow) var(--ease-out);
	}
	.drop {
		color: var(--miso-line);
		background: var(--hatch);
	}
	.fill {
		background: var(--miso);
		border-top: 2px solid var(--edge);
	}
	.pct {
		position: absolute;
		left: 10px;
		margin-bottom: 6px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		transition: bottom var(--dur-slow) var(--ease-out);
	}
	.pct.inside {
		transform: translateY(calc(100% + 12px));
		color: var(--on-vermilion);
	}
	.label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px 2px 0;
		font-size: 12.5px;
	}
	.step-n {
		font-size: 11px;
		color: var(--text-3);
	}
	.label strong {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.lost {
		color: var(--bad);
		font-size: 11.5px;
	}
	@media (max-width: 960px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
