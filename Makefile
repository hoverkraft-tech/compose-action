.PHONY: help

help: ## Display help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

lint: ## Execute linting
	$(call run_linter,)

lint-fix: ## Execute linting and fix
	$(call run_linter, \
		-e FIX_JSON_PRETTIER=true \
		-e FIX_YAML_PRETTIER=true \
		-e FIX_MARKDOWN=true \
		-e FIX_MARKDOWN_PRETTIER=true \
		-e FIX_NATURAL_LANGUAGE=true)

define run_linter
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	LINTER_IMAGE="linter:latest"; \
	VOLUME="$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE"; \
	docker build --build-arg UID=$(shell id -u) --build-arg GID=$(shell id -g) --tag $$LINTER_IMAGE .; \
	docker run \
		-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
		-e FILTER_REGEX_INCLUDE="$(filter-out $@,$(MAKECMDGOALS))" \
		-e IGNORE_GITIGNORED_FILES=true \
		-e KUBERNETES_KUBECONFORM_OPTIONS="--schema-location default --schema-location 'https://raw.githubusercontent.com/datreeio/CRDs-catalog/main/{{.Group}}/{{.ResourceKind}}_{{.ResourceAPIVersion}}.json'" \
		-e FILTER_REGEX_EXCLUDE=dist/**/* \
		-e VALIDATE_TYPESCRIPT_STANDARD=false \
        -e VALIDATE_TYPESCRIPT_ES=false \
        -e VALIDATE_TYPESCRIPT_PRETTIER=false \
        -e VALIDATE_JAVASCRIPT_ES=false \
        -e VALIDATE_JAVASCRIPT_STANDARD=false \
		$(1) \
		-v $$VOLUME \
		--rm \
		$$LINTER_IMAGE
endef

#############################
# Argument fix workaround
#############################
%:
	@: