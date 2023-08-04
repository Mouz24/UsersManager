import axios,  { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from 'axios';

interface AdaptAxiosRequestConfig extends AxiosRequestConfig {
  headers: AxiosRequestHeaders
}

interface RefreshErrorResponse {
  response: {
    status: number;
    data: {
      error: string;
    };
  };
}

const instance = axios.create({
  baseURL: 'http://localhost:5295/api/',
});

let isRefreshing = false;
let refreshSubscribers: ((accessToken: string) => void)[] = [];
let failedRequestQueue: AxiosRequestConfig[] = [];

// Function to add new subscribers waiting for the new access token
const subscribeTokenRefresh = (cb: (accessToken: string) => void) => {
  refreshSubscribers.push(cb);
};
// Function to handle token refreshing
const onRrefreshed = (accessToken: string, refreshToken: string) => {
  refreshSubscribers.forEach((cb) => cb(accessToken));
  refreshSubscribers = [];

  // Update the access token and refresh token in local storage
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Function to refresh the access token using the 'refresh' method
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');

    if (!refreshToken) {
      return null;
    }

    isRefreshing = true;

    const response = await axios.post(`http://localhost:5295/api/token/refresh`, { accessToken , refreshToken } );
    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken;

    isRefreshing = false;
    onRrefreshed(newAccessToken, newRefreshToken);

    return newAccessToken;
  } catch (error: any) { // Use AxiosError as the type for the error variable
    console.error('Error refreshing access token:', error);

    // Check if the error response indicates an expired refresh token
    if (error.response?.status === 400 && error.response?.data === 'Invalid client request') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login'; // Redirect to the login page when the refresh token is expired
      return null;
    }

    isRefreshing = false;
    return null;
  }
};

// Request interceptor to add authorization headers (access token) to every request
instance.interceptors.request.use(
  (config): AdaptAxiosRequestConfig => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const headers = {
        ...(config.headers as AxiosRequestHeaders),
        'Authorization': `Bearer ${accessToken}`,
      };
      config.headers = headers as AxiosRequestHeaders;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  async (response: AxiosResponse): Promise<AxiosResponse> => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    console.log('Response Error:', error);  
    const originalRequest = error.config as AdaptAxiosRequestConfig;
    const refreshToken = localStorage.getItem('refreshToken');

    if (error.response && error.response.status === 401 && refreshToken && !originalRequest.headers['X-Retry']) {
      if (!isRefreshing) {
        console.log('Refreshing access token...');
        originalRequest.headers['X-Retry'] = 'true';
        const newAccessToken = await refreshAccessToken();
        delete originalRequest.headers['X-Retry'];

        if (newAccessToken) {
          console.log('Token refreshed successfully. Retrying the original request.');
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } else {
          console.log('Token refresh failed. Redirecting to login page.');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        console.log('Another request is already refreshing the token. Waiting for the new token.');
        return new Promise((resolve) => {
          subscribeTokenRefresh((accessToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            resolve(instance(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);


export default instance;