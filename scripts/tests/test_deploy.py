"""Testes de orquestração; não acedem ao Docker ou a dados reais."""
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'deploy.sh'
FAKE_DOCKER = r'''#!/usr/bin/env python3
import json, os, sys
args = sys.argv[1:]
with open(os.environ['CALLS'], 'a') as log:
    log.write(json.dumps(args) + '\n')
fail = os.environ.get('FAIL_STEP')
if fail == 'build' and 'build' in args: sys.exit(1)
if fail == 'backup' and 'pg_dump' in args: sys.exit(1)
if fail == 'migration' and 'run' in args and args[-1] == 'migrate': sys.exit(1)
if args[:2] == ['volume', 'ls'] and os.environ.get('EXISTING_VOLUME'): print('health_postgres_data')
if 'pg_dump' in args: print('PGDMP-test')
if 'bootstrap.cjs' in ' '.join(args): print('Instalação existente.')
if 'port' in args: print('127.0.0.1:8080')
'''

class DeployTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / 'scripts').mkdir()
        shutil.copy2(SCRIPT, self.root / 'scripts/deploy.sh')
        (self.root / 'bin').mkdir()
        docker = self.root / 'bin/docker'
        docker.write_text(FAKE_DOCKER)
        docker.chmod(0o755)
        self.calls = self.root / 'calls.jsonl'
        self.env = os.environ.copy()
        for name in ['COMPOSE_PROJECT_NAME', 'DEPLOY_ENV_FILE', 'WEB_PORT', 'WEB_BIND', 'APP_URL']:
            self.env.pop(name, None)
        self.env.update(PATH=str(self.root / 'bin') + ':' + self.env['PATH'], CALLS=str(self.calls))

    def deploy(self, fail=None):
        if fail: self.env['FAIL_STEP'] = fail
        return subprocess.run(['bash', 'scripts/deploy.sh'], cwd=self.root, env=self.env,
                              capture_output=True, text=True)

    def commands(self):
        return [json.loads(line) for line in self.calls.read_text().splitlines()]

    def test_first_run_and_repeat_preserve_secrets_and_order(self):
        first = self.deploy()
        self.assertEqual(first.returncode, 0, first.stderr)
        secret_file = self.root / '.env'
        contents = secret_file.read_bytes()
        self.assertEqual(secret_file.stat().st_mode & 0o777, 0o600)
        values = dict(line.split('=', 1) for line in contents.decode().splitlines())
        self.assertEqual(len(values['POSTGRES_PASSWORD']), 96)
        self.assertNotEqual(values['POSTGRES_PASSWORD'], values['JWT_SECRET'])
        calls = self.commands()
        index = lambda token: next(i for i, call in enumerate(calls) if token in call)
        self.assertLess(index('build'), index('stop'))
        self.assertLess(index('pg_dump'), next(i for i, call in enumerate(calls) if 'run' in call and call[-1] == 'migrate'))
        self.assertEqual(self.deploy().returncode, 0)
        self.assertEqual(secret_file.read_bytes(), contents)

    def test_failed_build_does_not_stop_services(self):
        self.assertNotEqual(self.deploy('build').returncode, 0)
        self.assertFalse(any('stop' in call for call in self.commands()))

    def test_failed_backup_restarts_old_containers(self):
        self.assertNotEqual(self.deploy('backup').returncode, 0)
        calls = self.commands()
        self.assertTrue(any('start' in call for call in calls))
        self.assertFalse(any('run' in call and call[-1] == 'migrate' for call in calls))

    def test_failed_migration_keeps_application_stopped(self):
        self.assertNotEqual(self.deploy('migration').returncode, 0)
        calls = self.commands()
        self.assertFalse(any('start' in call for call in calls))
        self.assertFalse(any('up' in call and 'api' in call for call in calls))

    def test_missing_env_with_existing_volume_does_not_regenerate_secrets(self):
        self.env['EXISTING_VOLUME'] = '1'
        result = self.deploy()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Recupere o .env original', result.stderr)
        self.assertFalse((self.root / '.env').exists())
        self.assertFalse(any('build' in call for call in self.commands()))

    def test_concurrent_deploy_is_rejected(self):
        lock = self.root / 'private/deploy/health/deploy.lock'
        lock.parent.mkdir(parents=True)
        with lock.open('w') as handle:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
            result = self.deploy()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Já existe um deploy', result.stderr)

if __name__ == '__main__':
    unittest.main()
