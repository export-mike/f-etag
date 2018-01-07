[![Build Status](https://travis-ci.org/export-mike/f-etag.svg?branch=master)](https://travis-ci.org/export-mike/f-etag)
# f-etag

A thin wrapper around the `fetch` API. For a given 200 response with an ETag header we resolve the promise for the current request and clone the response and store it in an in-memory cache. For a 304 response with a matching ETag header we resolve the same response object from the previous 200 response.

## Why ETag caching?

They’re a pain to deal with having to check for 304 and deal with the caching strategy yourself, this is not designed to work between refreshes in the browser. This library is aimed towards browser usage. But it’s not setup between browser refreshes? Yes this is a requirement of an existing project but by all means plugin a caching strategy somehow in a PR.

## Install

```shell
npm install f-etag isomorphic-unfetch
```

## Usage

```js
import 'isomorphic-unfetch'
import eFetch from 'f-etag';

// Use eFetch like the normal fetch API.
```
