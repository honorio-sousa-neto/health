#!/usr/bin/env bash
# Deploy completo: configuração inicial, build, backup, migrações e healthchecks.
set -Eeuo pipefail
umask 077
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
if [[ ${1:-} == --help ]]; then
  cat <<'HELP'
Uso: bash scripts/deploy.sh
Requisitos: Bash, Docker com Compose v2 e flock; acesso ao daemon Docker.
Na primeira execução, cria .env com segredos aleatórios. APP_URL, WEB_PORT e
WEB_BIND podem definir o endereço inicial (ex.: APP_URL=https://clinica.exemplo).
Execuções seguintes preservam .env e os volumes existentes.
DEPLOY_ENV_FILE permite usar outro ficheiro de ambiente.
HELP
  exit 0
fi
[[ $# == 0 ]] || { echo 'Argumento desconhecido. Use --help.' >&2; exit 1; }
for program in docker flock od tr; do
  command -v "$program" >/dev/null || { echo "Falta instalar: $program" >&2; exit 1; }
done
docker compose version >/dev/null
docker info >/dev/null 2>&1 || { echo 'Sem acesso ao daemon Docker. Verifique o serviço e as permissões.' >&2; exit 1; }
state_dir="private/deploy/${COMPOSE_PROJECT_NAME:-health}"
mkdir -p "$state_dir"
exec 9>"$state_dir/deploy.lock"
flock -n 9 || { echo 'Já existe um deploy em execução.' >&2; exit 1; }
random_secret() { od -An -N48 -tx1 /dev/urandom | tr -d ' \n'; }
ENV_FILE="${DEPLOY_ENV_FILE:-$ROOT/.env}"
if [[ ! -e "$ENV_FILE" ]]; then
  # Não substituir segredos de uma instalação existente.
  if [[ -n "$(docker volume ls -q --filter "label=com.docker.compose.project=${COMPOSE_PROJECT_NAME:-health}" --filter label=com.docker.compose.volume=postgres_data)" ]]; then
    echo 'Existe uma instalação mas falta o ficheiro de ambiente. Recupere o .env original.' >&2
    exit 1
  fi
  initial_port="${WEB_PORT:-8080}"
  initial_origin="${APP_URL:-http://localhost:$initial_port}"
  [[ "$initial_origin" =~ ^https?://[^[:space:]]+$ && "$initial_port" =~ ^[0-9]+$ ]] || { echo 'APP_URL ou WEB_PORT inválido.' >&2; exit 1; }
  (
    set -o noclobber
    printf 'POSTGRES_PASSWORD=%s\nJWT_SECRET=%s\nWEB_PORT=%s\nWEB_BIND=%s\nALLOWED_ORIGINS=%s\n' \
      "$(random_secret)" "$(random_secret)" "$initial_port" "${WEB_BIND:-0.0.0.0}" "${initial_origin%/}" > "$ENV_FILE"
  )
  echo "Configuração inicial criada em $ENV_FILE (guardar em local seguro)."
fi
compose=(docker compose --project-directory "$ROOT" --env-file "$ENV_FILE")
"${compose[@]}" config --quiet
phase='preparação'
restart_on_failure=false
on_error() {
  local code=$?
  trap - ERR
  echo "Deploy interrompido na fase: $phase (código $code)." >&2
  if [[ "$restart_on_failure" == true ]]; then
    echo 'A reactivar os containers anteriores, sem recriar imagens nem volumes.' >&2
    "${compose[@]}" start api web >&2 || true
  fi
  echo 'Consultar: docker compose logs --tail=100 migrate api web' >&2
  exit "$code"
}
trap on_error ERR
phase='construção das imagens'
echo 'A construir as imagens; a aplicação existente continua disponível.'
"${compose[@]}" build api web
phase='arranque do PostgreSQL'
"${compose[@]}" up -d --wait --wait-timeout 120 database
phase='backup antes da actualização'
# Suspender escritas para manter o backup da base e dos uploads coerente.
restart_on_failure=true
"${compose[@]}" stop web api
backup_dir="$ROOT/private/backups/deploy/${COMPOSE_PROJECT_NAME:-health}/$(date -u +%Y%m%dT%H%M%SZ)-$$"
mkdir -p "$backup_dir"
"${compose[@]}" exec -T database pg_dump -U alfavida -d alfavida --format=custom --no-owner --no-acl > "$backup_dir/database.dump"
"${compose[@]}" exec -T database pg_restore --list < "$backup_dir/database.dump" > /dev/null
"${compose[@]}" run --rm --no-deps -T --user root --entrypoint tar api -czf - -C /app/back/private/uploads . > "$backup_dir/uploads.tar.gz"
printf 'Backup anterior às migrações; base alfavida e uploads.\n' > "$backup_dir/README.txt"
echo "Backup guardado: $backup_dir"
phase='migrações da base de dados'
# Uma migração falhada exige intervenção: não arrancar código contra schema parcial.
restart_on_failure=false
"${compose[@]}" run --rm --no-deps -T migrate
phase='preparação da primeira instalação'
initial_password="$(random_secret)"
bootstrap_output="$(INITIAL_ADMIN_PASSWORD="$initial_password" "${compose[@]}" run --rm --no-deps -T -e INITIAL_ADMIN_PASSWORD migrate node scripts/bootstrap.cjs)"
printf '%s\n' "$bootstrap_output"
if [[ "$bootstrap_output" == *BOOTSTRAP_ADMIN_CREATED* ]]; then
  printf 'Utilizador: admin\nPalavra-passe: %s\n' "$initial_password" > "$state_dir/initial-admin.txt"
  echo "Credenciais iniciais guardadas em $state_dir/initial-admin.txt (acesso restrito)."
fi
unset initial_password
phase='arranque e verificação dos serviços'
# As migrações já passaram; ignorar o serviço temporário na subida dos serviços finais.
"${compose[@]}" up -d --no-deps --wait --wait-timeout 180 api web
"${compose[@]}" exec -T api node -e '
(async () => {
  const page = await fetch("http://web/");
  if (!page.ok || !(await page.text()).toLowerCase().includes("<!doctype html>")) throw Error("Frontend indisponível");
  const api = await fetch("http://web/api/users");
  if (api.status !== 401) throw Error("Proxy da API não respondeu como esperado");
  const socket = await fetch("http://web/socket.io/?EIO=4&transport=polling");
  if (!socket.ok || !(await socket.text()).startsWith("0{")) throw Error("Socket.IO indisponível");
})().catch(error => { console.error(error.message); process.exitCode = 1; });'
trap - ERR
"${compose[@]}" ps
echo 'Deploy concluído. Frontend publicado em:'
"${compose[@]}" port web 80
echo "Backups: $backup_dir"
