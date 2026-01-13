/**
 * Stub Memory Adapter
 *
 * Provides in-memory, non-persistent recall.
 * Used to satisfy runtime dependencies without storage.
 */

export interface MemoryQuery {
  key: string;
}

export interface MemoryWrite {
  key: string;
  value: any;
}

export class StubMemory {
  private store: Record<string, any> = {};

  async read(query: MemoryQuery): Promise<any | null> {
    return this.store[query.key] ?? null;
  }

  async write(entry: MemoryWrite): Promise<void> {
    this.store[entry.key] = entry.value;
  }
}