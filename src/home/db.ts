import type {DBSchema, IDBPDatabase} from 'idb'
import {openDB} from 'idb'

interface Ai0DB extends DBSchema {
    messages: {
        value: MessageStore
        key: number
        indexes: {
            'by-userId': string,
        }
    }
}

class DatabaseManager {
    private readonly dbName: string;
    private readonly version: number;
    private db: IDBPDatabase<Ai0DB> | null = null;

    constructor(dbName: string = 'ai0', version: number = 1) {
        this.dbName = dbName;
        this.version = version;
    }

    async initialize(): Promise<void> {
        console.log('db initialize')
        try {
            this.db = await openDB<Ai0DB>(this.dbName, this.version, {
                blocked() {
                    console.log('blocked');
                },
                upgrade(db) {
                    const messages = db.createObjectStore('messages', {
                        keyPath: 'id',
                        autoIncrement: true,
                    })
                    messages.createIndex('by-userId', 'userId')
                },
                blocking() {
                    console.log('blocking');
                },
                terminated() {
                    console.log('terminated');
                },
            })
            console.log('Database opened successfully');
        } catch (error) {
            console.error('Failed to open/create IndexedDB:', error);
        }
        console.log('this.db',this.db)
    }

    async findMessage(id: number): Promise<MessageStore | undefined> {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.')
        }
        return await this.db.get('messages', id)
    }

    async addMessage(message: Omit<MessageStore, 'id'>): Promise<number> {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return await this.db.add('messages', message)
    }

    async removeMessage(id: number): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.')
        }
        await this.db.delete('messages', id)
    }

    async clearMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized. Call initialize() first.'))
                return
            }

            const transaction = this.db.transaction('messages', 'readwrite')
            const store = transaction.objectStore('messages')

            store.clear()
            resolve()
        })
    }

    async findMessages(limit: number, offset: number): Promise<MessageStore[]> {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }

        const messages: MessageStore[] = []
        if (limit < 1) {
            return new Promise((resolve) => resolve(messages))
        }

        const transaction = this.db.transaction('messages', 'readonly')
        const store = transaction.objectStore('messages')

        let cursor = await store.openCursor(null, 'prev')
        while (cursor) {
            if (offset < 1) {
                limit--
                messages.push(cursor.value)
            } else {
                offset--
            }

            if (limit < 1) {
                break
            }
            cursor = await cursor.continue()
        }

        return new Promise((resolve) => resolve(messages))
    }

    async findMessagesByUser(userId: string, limit: number, offset: number): Promise<MessageStore[]> {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }

        const messages: MessageStore[] = []
        if (limit < 1) {
            return new Promise((resolve) => resolve(messages))
        }

        const transaction = this.db.transaction('messages', 'readonly')
        const store = transaction.objectStore('messages')

        let cursor = await store.openCursor(null, 'prev')
        while (cursor) {
            if (cursor.value.userId === userId) {
                if (offset < 1) {
                    limit--
                    messages.push(cursor.value)
                } else {
                    offset--
                }
            }

            if (limit < 1) {
                break
            }
            cursor = await cursor.continue()
        }

        return new Promise((resolve) => resolve(messages))
    }
}

export {DatabaseManager}