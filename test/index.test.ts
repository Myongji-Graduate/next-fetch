import { nextFetch, RequestInit } from '../src';

describe('next-fetch', () => {
  const globalFetch = global.fetch;
  let fetchMocked: jest.Mock;
  let mockRequestInterceptor: jest.Mock;
  let mockResponseInterceptor: jest.Mock;

  beforeEach(() => {
    fetchMocked = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        userId: 1,
        id: 1,
        title: 'delectus aut autem',
        completed: false,
      }),
    });

    // @ts-ignore
    global.fetch = fetchMocked;
    mockRequestInterceptor = jest
      .fn()
      .mockImplementation((requestArg: RequestInit) => {
        return requestArg;
      });

    mockResponseInterceptor = jest
      .fn()
      .mockImplementation(
        (response: Response): Response | Promise<Response> => {
          return response;
        },
      );
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = globalFetch;
  });

  it('should call next fetch default option when default option is not specified.', async () => {
    // given
    const instance = nextFetch.create();

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1');

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      //default
      {
        headers: new Headers([['Content-Type', 'application/json']]),
        method: 'GET',
        throwError: false,
      },
    );
  });

  it('should apply default headers.', async () => {
    // given
    const instance = nextFetch.create({
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1');

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        headers: new Headers({
          'Content-Type': 'application/json',
          accept: 'application/json',
        }),
        method: 'GET',
        throwError: false,
      },
    );
  });

  it('should override default headers', async () => {
    // given
    const instance = nextFetch.create({
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        headers: new Headers([['Content-Type', 'application/json']]),
        method: 'GET',
        throwError: false,
      },
    );
  });

  it('should call request, response interceptors', async () => {
    // given
    const instance = nextFetch.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      requestInterceptor: mockRequestInterceptor,
      responseInterceptor: mockResponseInterceptor,
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // then
    expect(mockRequestInterceptor).toHaveBeenCalled();
    expect(mockResponseInterceptor).toHaveBeenCalled();
  });

  it('should response type json', async () => {
    // given
    const instance = nextFetch.create({
      responseType: 'json',
    });

    //when
    const data = await instance.get(
      'https://jsonplaceholder.typicode.com/todos/1',
    );
    //then
    expect(typeof data).toEqual(typeof JSON);
  });
});

describe('next-fetch-error', () => {
  const globalFetch = global.fetch;
  let fetchMocked: jest.Mock;

  beforeEach(() => {
    fetchMocked = jest.fn().mockResolvedValue({
      status: 300,
      json: jest.fn().mockResolvedValue({
        error: 'Multiple choices available',
      }),
    });

    // @ts-ignore
    global.fetch = fetchMocked;
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = globalFetch;
  });

  it('should throw error above status 300.', async () => {
    // given
    const instance = nextFetch.create({
      throwError: true,
    });
    let error;

    // when
    try {
      await instance.get('https://jsonplaceholder.typicode.com/Error/1');
    } catch (e) {
      error = e;
    }

    // then
    expect(error).toBeDefined();
  });
});
