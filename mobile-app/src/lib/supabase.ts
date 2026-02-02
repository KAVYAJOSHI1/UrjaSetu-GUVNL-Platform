import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamically determine backend URL based on current window location
const getBaseUrl = () => {
  // In React Native, 'window.location' might be undefined or behave differently.
  // We should purely rely on the manual configuration for mobile.

  // Checking for window existence is fine for Web, but strict check for RN:
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000';
    return `http://${host}:3000`;
  }

  // Fallback for Mobile (React Native) -> Use Local IP
  // REPLACE THIS WITH YOUR MACHINE'S LOCAL IP ADDRESS
  return 'http://192.168.16.108:3000';
};

const BASE_URL = getBaseUrl();

class QueryBuilder {
  table: string;
  baseUrl: string;
  queryParams: URLSearchParams;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  isSingle: boolean = false;
  bucket: string | null = null;

  constructor(table: string, url: string = BASE_URL, bucket: string | null = null) {
    this.table = table;
    this.baseUrl = url;
    this.bucket = bucket;
    this.queryParams = new URLSearchParams();
    this.method = 'GET';
    this.body = null;
    this.headers = { 'Content-Type': 'application/json' };
  }

  select(cols: any = '*') {
    this.queryParams.append('select', cols);
    return this;
  }

  eq(column: any, value: any) {
    this.queryParams.append(column, `eq.${value}`);
    return this;
  }

  neq(column: any, value: any) {
    this.queryParams.append(column, `neq.${value}`);
    return this;
  }

  order(column: any, options: any = {}) {
    const { ascending = true } = options;
    this.queryParams.append('order', `${column}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  in(column: any, values: any[]) {
    // Supabase format: col=in.(val1,val2)
    const valString = `(${values.join(',')})`;
    this.queryParams.append(column, `in.${valString}`);
    return this;
  }

  limit(count: any) {
    this.queryParams.append('limit', count);
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // Insert
  insert(data: any) {
    this.method = 'POST';
    this.body = JSON.stringify(data);
    return this;
  }

  // Update
  update(data: any) {
    this.method = 'PATCH';
    this.body = JSON.stringify(data);
    return this;
  }

  // File Upload (Real fetch implementation)
  async upload(path: any, file: any) {
    if (this.table === 'storage' && this.bucket) {
      const url = `${this.baseUrl}/storage/v1/object/${this.bucket}/${path}`;
      try {
        // file is expected to be FormData if coming from ReportScreen
        const res = await fetch(url, {
          method: 'POST',
          body: file
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: data };
        return { data: { path: data.path, Key: data.Key }, error: null };
      } catch (e) {
        return { data: null, error: e };
      }
    }
    return Promise.resolve({ data: { path }, error: null as any });
  }

  getPublicUrl(path: any) {
    if (this.table === 'storage' && this.bucket) {
      // Return local static url
      return { data: { publicUrl: `${this.baseUrl}/storage/v1/object/public/${this.bucket}/${path}` } };
    }
    return { data: { publicUrl: 'https://via.placeholder.com/150' } };
  }

  async execute() {
    // Check if it's storage
    if (this.table === 'storage') {
      // Return mock storage object with bound methods
      return {
        upload: (p: any, f: any) => this.upload(p, f),
        getPublicUrl: (p: any) => this.getPublicUrl(p),
        from: (bucket: any) => this // chaining hack
      };
    }

    let url = `${this.baseUrl}/rest/v1/${this.table}`;
    if (this.queryParams.toString()) {
      url += `?${this.queryParams.toString()}`;
    }

    try {
      const res = await fetch(url, {
        method: this.method,
        headers: this.headers,
        body: this.body
      });

      const data = await res.json();

      if (!res.ok) {
        return { data: null, error: data };
      } else {
        if (this.isSingle && Array.isArray(data)) {
          return { data: data[0] || null, error: null };
        } else {
          return { data, error: null };
        }
      }
    } catch (error) {
      return { data: null, error };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// Hardcoded Session for Bypass
const MOCK_SESSION = {
  access_token: "mock-token",
  token_type: "bearer",
  user: {
    id: "citizen-user-id",
    email: "citizen@urjasetu.com",
    role: "citizen",
    user_metadata: {
      name: "Test Citizen",
      phone: "9876543210"
    }
  }
};

export const supabase = {
  // Auth Namespace
  auth: {
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const response = await fetch(`${BASE_URL}/auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
          return { data: { user: null, session: null }, error: data };
        }
        await AsyncStorage.setItem('sb-session', JSON.stringify(data));
        return { data: { user: data.user, session: data }, error: null };
      } catch (e: any) {
        return { data: { user: null, session: null }, error: e };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const response = await fetch(`${BASE_URL}/auth/v1/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, data: options?.data })
        });
        const data = await response.json();
        if (!response.ok) {
          return { data: { user: null, session: null }, error: data };
        }
        await AsyncStorage.setItem('sb-session', JSON.stringify(data));
        return { data: { user: data.user, session: data }, error: null };
      } catch (e: any) {
        return { data: { user: null, session: null }, error: e };
      }
    },
    signOut: async () => {
      await AsyncStorage.removeItem('sb-session');
      return { error: null };
    },
    getSession: async () => {
      try {
        const stored = await AsyncStorage.getItem('sb-session');
        if (stored) {
          const session = JSON.parse(stored);
          return { data: { session }, error: null };
        }
      } catch (e) {
        // ignore
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Simple stub. In a real app we'd trigger this on login/logout.
      // For now, AuthContext handles the state updates manually.
      return { data: { subscription: { unsubscribe: () => { } } } };
    }
  },

  // DB Namespace
  from: (table: any) => {
    return new QueryBuilder(table);
  },

  // Storage Namespace
  storage: {
    from: (bucket: any) => {
      return new QueryBuilder('storage', BASE_URL, bucket);
    }
  },

  // AI Functions
  functions: {
    invoke: async (functionName: string, { body }: any) => {
      if (functionName === 'analyze-image') {
        try {
          // Check if body is FormData (image upload)
          const isFormData = body instanceof FormData;
          const headers: any = {};
          if (!isFormData) {
            headers['Content-Type'] = 'application/json';
          }

          const response = await fetch(`${BASE_URL}/functions/v1/${functionName}`, {
            method: 'POST',
            headers: headers,
            body: body
          });

          const data = await response.json();
          return { data, error: null };
        } catch (e) {
          return { data: null, error: e };
        }
      }
      return { data: null, error: { message: "Function not found" } };
    }
  }
};
