// Lightweight Supabase client — no npm dependency needed
// Uses PostgREST API directly via fetch

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const REST_URL = `${SUPABASE_URL}/rest/v1`

export const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

interface QueryOptions {
  table: string
  select?: string
  filters?: Record<string, string>
  order?: string
  limit?: number
  single?: boolean
}

async function query<T = any>(options: QueryOptions): Promise<{ data: T | null; error: string | null }> {
  const { table, select = '*', filters = {}, order, limit, single } = options

  const params = new URLSearchParams({ select })
  for (const [key, val] of Object.entries(filters)) {
    params.append(key, val)
  }
  if (order) params.append('order', order)
  if (limit) params.append('limit', String(limit))

  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }
  if (single) {
    headers['Accept'] = 'application/vnd.pgrst.object+json'
  }

  try {
    const resp = await fetch(`${REST_URL}/${table}?${params}`, { headers })
    if (!resp.ok) {
      const errText = await resp.text()
      return { data: null, error: `${resp.status}: ${errText}` }
    }
    const data = await resp.json()
    return { data, error: null }
  } catch (err) {
    return { data: null, error: String(err) }
  }
}

// Supabase-like query builder
class QueryBuilder<T = any> {
  private _table: string
  private _select = '*'
  private _filters: Record<string, string> = {}
  private _order?: string
  private _limit?: number
  private _single = false

  constructor(table: string) {
    this._table = table
  }

  select(columns: string = '*') {
    this._select = columns
    return this
  }

  eq(column: string, value: string | number | boolean) {
    this._filters[column] = `eq.${value}`
    return this
  }

  not(column: string, operator: string, value: any) {
    this._filters[column] = `not.${operator}.${value}`
    return this
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this._order = `${column}.${opts?.ascending !== false ? 'asc' : 'desc'}`
    return this
  }

  limit(n: number) {
    this._limit = n
    return this
  }

  single() {
    this._single = true
    return this
  }

  async then(resolve: (val: { data: T | null; error: string | null }) => void) {
    const result = await query<T>({
      table: this._table,
      select: this._select,
      filters: this._filters,
      order: this._order,
      limit: this._limit,
      single: this._single,
    })
    resolve(result)
  }
}

// Export a supabase-like interface
export const supabase = {
  from<T = any>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table)
  },
}
