class DatabaseService {
  private static instance: DatabaseService;
  private storage: Storage;

  private constructor() {
    this.storage = window.localStorage;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize() {
    // Initialize default data if not exists
    if (!this.storage.getItem('user_profiles')) {
      this.storage.setItem('user_profiles', '[]');
    }
    if (!this.storage.getItem('tasks')) {
      this.storage.setItem('tasks', '[]');
    }
    if (!this.storage.getItem('events')) {
      this.storage.setItem('events', '[]');
    }
    if (!this.storage.getItem('timetable')) {
      this.storage.setItem('timetable', '[]');
    }
  }

  private getCollection(name: string): any[] {
    const data = this.storage.getItem(name);
    return data ? JSON.parse(data) : [];
  }

  private setCollection(name: string, data: any[]) {
    this.storage.setItem(name, JSON.stringify(data));
  }

  public async query(collection: string, filter: Record<string, any> = {}): Promise<any[]> {
    const data = this.getCollection(collection);
    return data.filter(item => {
      return Object.entries(filter).every(([key, value]) => item[key] === value);
    });
  }

  public async execute(operation: string, collection: string, data: any): Promise<any> {
    const currentData = this.getCollection(collection);
    
    if (operation === 'INSERT') {
      const newId = currentData.length > 0 ? Math.max(...currentData.map(item => item.id)) + 1 : 1;
      const newItem = { id: newId, ...data };
      currentData.push(newItem);
      this.setCollection(collection, currentData);
      return newItem;
    }
    
    if (operation === 'UPDATE') {
      const index = currentData.findIndex(item => item.id === data.id);
      if (index !== -1) {
        currentData[index] = { ...currentData[index], ...data };
        this.setCollection(collection, currentData);
        return currentData[index];
      }
    }
    
    return null;
  }
}

export default DatabaseService; 