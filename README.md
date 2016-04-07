#eFetch
A thin wrapper around fetch api, we use `isomorphic-fetch` to allow this to work in a node environment.
For a given 200 response with an Etag header we resolve the promise for the current request and clone
response and store it in an in memory cache. For a 304 response with a matching ETag header we resolve the same
response object from the previous 200 response.

## Why etag caching?
They're a pain to deal with this

#install:
  npm i --save efetch

#Usage:

``` Javascript
  import eFetch from 'f-etag';
  // use eFetch like the normal fetch api.
```
