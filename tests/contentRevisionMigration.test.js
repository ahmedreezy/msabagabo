import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migrationPath = new URL('../supabase/migrations/008_content_revisions.sql', import.meta.url)

test('revision migration preserves live content and restricts approval to publishers', async () => {
  const sql = await readFile(migrationPath, 'utf8')

  assert.match(sql, /create table if not exists public\.cms_entry_revisions/i)
  assert.match(sql, /review_status in \('draft', 'in_review'\)/i)
  assert.match(sql, /cms_has_role\(array\['publisher', 'admin'\]\)/i)
  assert.match(sql, /create or replace function public\.publish_cms_revision/i)
  assert.match(sql, /create or replace function public\.rollback_cms_entry/i)
})

test('owner release publication is atomic and validates structured records', async () => {
  const sql = await readFile(migrationPath, 'utf8')

  assert.match(sql, /create or replace function public\.publish_cms_release/i)
  assert.match(sql, /Every active record in the release must be approved/i)
  assert.match(sql, /cms_owner_payload_is_publishable/i)
  assert.match(sql, /jsonb_array_length\(supplied_payload -> 'answerBlocks'\) > 0/i)
  assert.match(sql, /jsonb_array_length\(supplied_payload -> 'contractPackages'\) > 0/i)
  assert.match(sql, /jsonb_array_length\(supplied_payload -> 'implementationUpdates'\) > 0/i)
  assert.match(sql, /payload ->> 'contentRelease' = supplied_release_key/i)
})
