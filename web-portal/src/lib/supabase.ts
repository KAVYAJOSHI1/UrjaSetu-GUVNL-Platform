
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

export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: unknown | null;
  count: number | null;
}

const BASE_URL = getBaseUrl();

class QueryBuilder {
  table: string;
  baseUrl: string;
  queryParams: URLSearchParams;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  isSingle: boolean = false;

  constructor(table: string, url: string = BASE_URL) {
    this.table = table;
    this.baseUrl = url;
    this.queryParams = new URLSearchParams();
    this.method = 'GET';
    this.body = null;
    this.headers = { 'Content-Type': 'application/json' };
  }

  select(cols: string = '*', options: { count?: string; head?: boolean } = {}) {
    this.queryParams.append('select', cols);
    // Store options to handle count/head later
    if (options.count) {
      this.queryParams.append('count', options.count);
    }
    if (options.head) {
      this.method = 'HEAD';
    }
    return this;
  }

  eq(column: string, value: string | number | boolean) {
    this.queryParams.append(column, `eq.${value}`);
    return this;
  }

  in(column: string, values: (string | number)[]) {
    // Supabase format: col=in.(val1,val2)
    // Local backend simplified: we might need to handle this manually in server.js applyFilters or loop
    // For now generating the param:
    const valString = `(${values.join(',')})`;
    this.queryParams.append(column, `in.${valString}`);
    return this;
  }

  neq(column: string, value: string | number | boolean) {
    this.queryParams.append(column, `neq.${value}`);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    const { ascending = true } = options;
    this.queryParams.append('order', `${column}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  limit(count: number) {
    this.queryParams.append('limit', count.toString());
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // Insert
  insert(data: unknown) {
    this.method = 'POST';
    this.body = JSON.stringify(data);
    return this;
  }

  // Update
  update(data: unknown) {
    this.method = 'PATCH';
    this.body = JSON.stringify(data);
    return this;
  }

  // File Upload (mock)
  upload(path: string, _file: BodyInit | null) {
    // Not fully implemented in local backend yet, returning fake url
    return Promise.resolve({ data: { path }, error: null as unknown });
  }

  getPublicUrl(_path: string) {
    return { data: { publicUrl: 'https://via.placeholder.com/150' } };
  }

  async execute() {
    // Check if it's storage
    if (this.table === 'storage') {
      // Return mock storage object
      return {
        upload: this.upload,
        getPublicUrl: this.getPublicUrl,
        from: (_bucket: string) => this // chaining hack
      };
    }

    let url = `${this.baseUrl}/rest/v1/${this.table}`;
    if (this.queryParams.toString()) {
      url += `?${this.queryParams.toString()}`;
    }

    try {
      // If method is HEAD, we can't use db.all easily via the REST API unless the API supports it.
      // My minimal server.js might not support HEAD or returning count in headers.
      // Strategy: Use GET, fetch data, and return length as count. 
      // This is inefficient but works for local dev.
      const fetchMethod = this.method === 'HEAD' ? 'GET' : this.method;

      const res = await fetch(url, {
        method: fetchMethod,
        headers: this.headers,
        body: this.body
      });

      const data = await res.json();

      let count: number | null = null;
      if (Array.isArray(data)) {
        count = data.length;
      }

      if (!res.ok) {
        return { data: null, error: data, count: null };
      } else {
        if (this.isSingle && Array.isArray(data)) {
          return { data: data[0] || null, error: null, count };
        } else {
          // If HEAD was requested, data should be null? Supabase returns null data for HEAD?
          // Actually, if head: true, we just want count.
          const finalData = this.method === 'HEAD' ? null : data;
          return { data: finalData, error: null, count };
        }
      }
    } catch (error) {
      return { data: null, error, count: null };
    }
  }

  then<TResult1 = SupabaseResponse, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResponse) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
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
  // Auth Namespace
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
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
        // Persist session
        if (typeof window !== 'undefined') {
          localStorage.setItem('sb-session', JSON.stringify(data));
        }
        return { data: { user: data.user, session: data }, error: null };
      } catch (e: unknown) {
        return { data: { user: null, session: null }, error: e };
      }
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: unknown } }) => {
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
        // Persist session
        if (typeof window !== 'undefined') {
          localStorage.setItem('sb-session', JSON.stringify(data));
        }
        return { data: { user: data.user, session: data }, error: null };
      } catch (e: unknown) {
        return { data: { user: null, session: null }, error: e };
      }
    },
    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-session');
      }
      return { error: null };
    },
    getSession: async () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('sb-session');
        if (stored) {
          try {
            const session = JSON.parse(stored);
            return { data: { session }, error: null };
          } catch (e) {
            console.error("Failed to parse session", e);
            localStorage.removeItem('sb-session');
          }
        }
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (_callback: unknown) => {
      // Simple stub. In a real app we'd trigger this on login/logout.
      // For now, AuthContext handles the state updates manually.
      return { data: { subscription: { unsubscribe: () => { } } } };
    }
  },

  // DB Namespace
  from: (table: string) => {
    return new QueryBuilder(table);
  },

  // Storage Namespace
  storage: {
    from: (_bucket: string) => {
      return new QueryBuilder('storage'); // Hacky
    }
  },

  // AI Functions
  functions: {
    invoke: async (functionName: string, { body }: { body: BodyInit | null | undefined }) => {
      if (functionName === 'analyze-image') {
        try {
          // Check if body is FormData (image upload)
          const isFormData = body instanceof FormData;
          const headers: Record<string, string> = {};
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

