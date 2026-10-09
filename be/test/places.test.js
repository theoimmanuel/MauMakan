import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPlacesClient } from '../src/places.js'

test('search uses a server key, restaurant filter and explicit fields; normalizes optional data', async () => {
  const search = createPlacesClient({ apiKey: 'server-secret', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://places.googleapis.com/v1/places:searchText')
    assert.equal(options.headers['X-Goog-Api-Key'], 'server-secret')
    assert.ok(options.headers['X-Goog-FieldMask'].includes('places.attributions'))
    assert.ok(!options.headers['X-Goog-FieldMask'].includes('*'))
    assert.deepEqual(JSON.parse(options.body), {
      textQuery: 'restoran di Sleman', includedType: 'restaurant', strictTypeFiltering: true,
      languageCode: 'id', regionCode: 'ID', pageSize: 20,
    })
    return Response.json({ places: [{ id: 'google-id', displayName: { text: 'Warung' }, rating: 0 }] })
  } })
  const { places } = await search({ location: ' Sleman ' })
  assert.equal(places[0].name, 'Warung')
  assert.equal(places[0].rating, 0)
  assert.equal(places[0].priceLevel, null)
  assert.equal(places[0].address, null)
  assert.deepEqual(places[0].attributions, [])
})

test('validates location before contacting Google and handles missing configuration', async () => {
  const search = createPlacesClient({ apiKey: '', fetchImpl: () => assert.fail('must not call Google') })
  for (const location of [undefined, '', '  ', 123, {}, 'x'.repeat(201)]) {
    await assert.rejects(search({ location }), { status: 400 })
  }
  await assert.rejects(search({ location: 'Sleman' }), { status: 503 })
})

test('empty results are valid', async () => {
  const search = createPlacesClient({ apiKey: 'key', fetchImpl: async () => Response.json({}) })
  assert.deepEqual(await search({ location: 'Sleman' }), { places: [] })
})

for (const status of [400, 403, 429, 500]) {
  test(`Google ${status} is sanitized`, async () => {
    const search = createPlacesClient({ apiKey: 'secret', fetchImpl: async () => new Response('secret provider detail', { status }) })
    await assert.rejects(search({ location: 'Sleman' }), (error) => {
      assert.equal(error.status, status === 429 ? 503 : 502)
      assert.ok(!error.message.includes('secret'))
      return true
    })
  })
}

test('network, timeout and malformed response errors are handled', async () => {
  for (const [fetchImpl, status] of [
    [async () => { throw new TypeError('network') }, 502],
    [async () => { throw new DOMException('timeout', 'TimeoutError') }, 504],
    [async () => new Response('invalid json'), 502],
    [async () => Response.json({ places: {} }), 502],
    [async () => Response.json({ places: [null] }), 502],
  ]) {
    await assert.rejects(createPlacesClient({ apiKey: 'key', fetchImpl })({ location: 'Sleman' }), { status })
  }
})
