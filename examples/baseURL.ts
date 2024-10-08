import fetchAX from '../src';

// set baseUrl
const instance = fetchAX.create({
  baseURL: 'http://localhost:3000',
});

const basicResponse = instance.get('/');

const responseWithChangedUrl = instance.get('http://localhost:3001/');
