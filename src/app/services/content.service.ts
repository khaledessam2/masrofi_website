import {
  Injectable,
  signal,
  inject,
  PLATFORM_ID,
  TransferState,
  makeStateKey,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

interface Block {
  page: string;
  section: string;
  data: unknown;
}

const CONTENT_KEY = makeStateKey<Record<string, unknown>>('cms-content');

/**
 * Loads every editable block from Supabase once at startup and serves it to the
 * pages. Fetched on the server during SSR, cached into TransferState so the
 * browser reuses it instead of refetching. If Supabase is unreachable or not
 * configured, every page silently keeps its built-in fallback content.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly state = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly blocks = signal<Record<string, unknown>>({});

  private key(page: string, section: string): string {
    return `${page}/${section}`;
  }

  private configured(): boolean {
    return (
      !!environment.supabaseUrl &&
      !environment.supabaseUrl.includes('xxxx') &&
      !!environment.supabaseAnonKey &&
      environment.supabaseAnonKey !== 'your-anon-key'
    );
  }

  /** Called once from an app initializer, before the first page renders. */
  async load(): Promise<void> {
    // Browser hydration: reuse exactly what the server already fetched.
    if (this.state.hasKey(CONTENT_KEY)) {
      this.blocks.set(this.state.get(CONTENT_KEY, {}));
      return;
    }
    if (!this.configured()) return;

    try {
      const supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey,
        { auth: { persistSession: false } },
      );
      const { data, error } = await supabase
        .from('content_blocks')
        .select('page, section, data');
      if (error || !data) return;

      const map: Record<string, unknown> = {};
      for (const b of data as Block[]) {
        map[this.key(b.page, b.section)] = b.data;
      }
      this.blocks.set(map);
      if (isPlatformServer(this.platformId)) {
        this.state.set(CONTENT_KEY, map);
      }
    } catch {
      // Network/DB unavailable — pages fall back to their built-in content.
    }
  }

  /** Returns the stored block for (page, section), or `fallback` if missing. */
  block<T>(page: string, section: string, fallback: T): T {
    const value = this.blocks()[this.key(page, section)];
    return value === undefined || value === null ? fallback : (value as T);
  }
}
