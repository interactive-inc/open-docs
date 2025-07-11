.PHONY: deploy deploy-client deploy-studio deploy-router check test

# Deploy docs package
deploy:
	bun biome check . --fix --unsafe
	bun run --cwd packages/docs check
	bun test
	bun run --cwd packages/docs deploy

# Deploy client (with checks and tests)
deploy-client:
	bun biome check . --fix --unsafe
	bun run --cwd packages/docs-client check
	bun test
	bun run --cwd packages/docs-client deploy

# Deploy router
deploy-router:
	bun biome check . --fix --unsafe
	bun run --cwd packages/docs-router check
	bun test
	bun run --cwd packages/docs-router deploy

# Deploy studio
deploy-studio:
	bun biome check . --fix --unsafe
	bun run --cwd packages/docs-studio check
	bun test
	bun run --cwd packages/docs-studio deploy

# Run all checks
check:
	bun biome check . --fix --unsafe
	bun --cwd packages/docs check
	bun --cwd packages/docs-client check
	bun --cwd packages/docs-router check
	bun --cwd packages/docs-studio check
	bun test
