dev:
	docker-compose up -d

dev-down:
	docker-compose down

server:
	deno run --allow-net --allow-read --allow-write --allow-env --allow-sys src/main.ts