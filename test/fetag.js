import 'isomorphic-unfetch'
import { expect } from 'chai'
import nock from 'nock'
import fEtag from '../src'

describe('Handles GET requests with E-Tags', () => {
  it('Should resolve the same payload from the first request in subsequent requests', () => {
    nock('http://example.com', {
      reqheaders: {
        'Access-Control-Expose-Headers': 'Etag'
      }
    })
    .get('/myhandler')
    .reply(200, {
      name: 'bob marley',
      vocation: 'Singer'
    }, {
      'Etag': '5211531b569301bc1d193377b980fe2d'
    })

    nock('http://example.com', {
      reqheaders: {
        'Access-Control-Expose-Headers': 'Etag',
        'If-None-Match': '5211531b569301bc1d193377b980fe2d'
      }
    })
    .get('/myhandler')
    .reply(304, undefined, {
      'Etag': '5211531b569301bc1d193377b980fe2d'
    })

    return fEtag('http://example.com/myhandler', {
      headers: {
        'Access-Control-Expose-Headers': 'Etag'
      }
    })
    .then(response => {
      expect(response.ok)
      expect(response.status).to.equal(200)
      expect(response.headers.get('etag')).to.equal('5211531b569301bc1d193377b980fe2d')
      return fEtag('http://example.com/myhandler', {
        headers: {
          'Access-Control-Expose-Headers': 'Etag'
        }
      })
    })
    .then(response => {
      expect(response.ok)
      expect(response.status).to.equal(200)
      expect(response.headers.get('etag')).to.equal('5211531b569301bc1d193377b980fe2d')
      return response.json()
    })
    .then(body => {
      expect(body).to.eql({
        name: 'bob marley',
        vocation: 'Singer'
      })
    })
  })
})

function verbTest(verb) {
  it(`skips over ${verb.toUpperCase()}`, () => {
    nock('http://example.com')[verb]('/myhandler', {
      hi: 'bob'
    })
    .times(2)
    .reply(200, { hi: 'wailers' }, {
      // etag here is actually useless but ensures the logic internally doesn't depend on it being there.
      etag: '123'
    })

    const notrequest = nock('http://example.com', {
      reqheaders: {
        'If-None-Match': '123'
      }
    })[verb]('/myhandler', {
      hi: 'bob'
    })
    .reply(200, { hi: 'wailers' }, {
      // etag here is actually useless but ensures the logic internally doesn't depend on it being there.
      etag: '123'
    })

    return fEtag('http://example.com/myhandler', {
      method: verb,
      body: JSON.stringify({
        hi: 'bob'
      })
    })
    .then(response => {
      expect(response.ok)
      expect(response.status).to.equal(200)
      expect(response.headers.get('etag')).to.equal('123')
      return response.json()
    })
    .then(body => {
      expect(body).to.eql({ hi: 'wailers' })
      return fEtag('http://example.com/myhandler', {
        method: verb,
        body: JSON.stringify({
          hi: 'bob'
        })
      })
    })
    .then(response => {
      expect(response.ok)
      expect(response.status).to.equal(200)
      expect(response.headers.get('etag')).to.equal('123')
      expect(notrequest.isDone()).to.equal(false)
    })
  })
}

describe('Skips over all other HTTP Verbs, PUT, POST, DELETE, PATCH, HEAD, MERGE', () => {
  verbTest('put')
  verbTest('post')
  verbTest('delete')
  verbTest('patch')
  verbTest('head')
  verbTest('merge')
})
