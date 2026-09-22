import axios, { AxiosError, AxiosHeaders } from 'axios';
import { apiClient, clearTokens, setTokens } from '../services/api-client';
describe('refresh and retry', () => {
  beforeEach(() => { clearTokens(); jest.restoreAllMocks(); });
  function expire(config: any) {
    return Promise.reject(new AxiosError('expired', 'ERR_BAD_REQUEST', config, undefined, { status: 401, statusText: 'Unauthorized', data: {}, headers: {}, config }));
  }
  function reply(config: any) { return Promise.resolve({ status: 200, statusText: 'OK', data: { ok: true }, headers: {}, config }); }
  it('refreshes auth/me and concurrent calls exactly once', async () => {
    setTokens('expired', 'refresh');
    const refresh = jest.spyOn(axios, 'post').mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return { data: { data: { accessToken: 'new', refreshToken: 'rotated' } } };
    });
    apiClient.defaults.adapter = config => config.headers.Authorization === 'Bearer new' ? reply(config) : expire(config);
    await Promise.all([apiClient.get('/auth/me'), apiClient.get('/projects')]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh.mock.calls[0][2]).toEqual({ timeout: 10000 });
  });
  it('recovers after missing refresh token without leaving requests queued', async () => {
    apiClient.defaults.adapter = config => config.headers.Authorization === 'Bearer new' ? reply(config) : expire(config);
    await expect(apiClient.get('/auth/me')).rejects.toBeDefined();
    setTokens('expired', 'refresh');
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'new', refreshToken: 'rotated' } } });
    await expect(apiClient.get('/auth/me')).resolves.toMatchObject({ status: 200 });
  });
  it('rejects every queued request when refresh fails', async () => {
    setTokens('expired', 'refresh');
    apiClient.defaults.adapter = expire;
    jest.spyOn(axios, 'post').mockRejectedValue(new AxiosError('invalid', undefined, undefined, undefined, { status: 401, statusText: 'Unauthorized', data: {}, headers: {}, config: { headers: new AxiosHeaders() } }));
    const results = await Promise.allSettled([apiClient.get('/projects'), apiClient.get('/auth/me')]);
    expect(results.every(result => result.status === 'rejected')).toBe(true);
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
  });
});
