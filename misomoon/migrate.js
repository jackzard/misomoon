// Applies migrations to CONTROL and to every SHARD_* database bound in wrangler.jsonc,
// by binding name, so it works whatever the databases are called.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const config = readFileSync(new URL('wrangler.jsonc', import.meta.url), 'utf8')
for (const [, binding] of config.matchAll(/"binding":\s*"(CONTROL|SHARD_(?:(?:EU|US|APAC)_)?\d+)"/g)) {
	console.log(`migrating ${binding}`)
	execFileSync('npx', ['wrangler', 'd1', 'migrations', 'apply', binding, '--remote'], { stdio: 'inherit' })
}
