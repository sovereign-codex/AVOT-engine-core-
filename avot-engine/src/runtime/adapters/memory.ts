export interface MemoryAdapter {
  search(query: string, sources: string[]): Promise<Array<{ source: string; snippet: string; ref?: string }>>;
}

export class StubMemory implements MemoryAdapter {
  async search(query: string, sources: string[]) {
    return sources.map(s => ({ source: s, snippet: `[[STUB MEMORY HIT for '${query}']]` }));
  }
}
