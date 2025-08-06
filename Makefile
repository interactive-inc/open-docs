.PHONY: deploy deploy-client deploy-studio deploy-router check test

check-client:
	bun run --cwd packages/docs-client check
	bun test

check-router:
	bun run --cwd packages/docs-router check
	bun test

check-studio:
	bun run --cwd packages/docs-studio check
	bun test

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
	bun --cwd packages/docs-client check
	bun --cwd packages/docs-router check
	bun --cwd packages/docs-studio check
	bun --cwd packages/docs check
	bun test

build:
	bun run --cwd packages/docs-client build
	bun run --cwd packages/docs-router build
	bun run --cwd packages/docs-studio build
	bun run --cwd packages/docs build

build-client:
	bun run --cwd packages/docs-client build

build-router:
	bun run --cwd packages/docs-router build

install:
	rm -rf packages/docs/node_modules
	rm -rf packages/docs-client/node_modules
	rm -rf packages/docs-router/node_modules
	rm -rf packages/docs-studio/node_modules
	bun i --cwd packages/docs-router @interactive-inc/docs-client@latest
	bun i
