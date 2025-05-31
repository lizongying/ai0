import type {DBSchema, IDBPDatabase} from 'idb'
import {openDB} from 'idb'

interface Ai0DB extends DBSchema {
    messages: {
        value: MessageStore
        key: number
        indexes: {
            'by-from': string,
            'by-to': string,
            'by-group': string,
        }
    }
}

class DatabaseManager {
    private readonly dbName: string;
    private readonly version: number;
    private db: IDBPDatabase<Ai0DB> | null = null;

    constructor(dbName: string = 'ai0', version: number = 3) {
        this.dbName = dbName
        this.version = version
    }

    async initialize(): Promise<void> {
        console.log('db initialize')
        try {
            this.db = await openDB<Ai0DB>(this.dbName, this.version, {
                blocked() {
                    console.log('blocked')
                },
                async upgrade(db, oldVersion, _, transaction) {
                    // From version 1 to version 2
                    if (oldVersion === 2) {
                        const messagesStore = transaction.objectStore('messages')

                        // Get all messages from the old store
                        const messages = await messagesStore.getAll()

                        // Delete the old store
                        db.deleteObjectStore('messages')

                        // Create new store with updated schema
                        const newMessagesStore = db.createObjectStore('messages', {
                            keyPath: 'id',
                            autoIncrement: true,
                        })

                        // Create new indexes
                        newMessagesStore.createIndex('by-from', 'from')
                        newMessagesStore.createIndex('by-to', 'to')
                        newMessagesStore.createIndex('by-group', 'group')

                        // Add all messages with the new schema
                        for (const message of messages) {
                            await newMessagesStore.add({
                                ...message,
                                group: message.to === 'all' ? message.to : message.from,
                            })
                        }
                    } else if (oldVersion === 1) {
                        const messagesStore = transaction.objectStore('messages')

                        // Get all messages from the old store
                        const messages = await messagesStore.getAll()

                        // Delete the old store
                        db.deleteObjectStore('messages')

                        // Create new store with updated schema
                        const newMessagesStore = db.createObjectStore('messages', {
                            keyPath: 'id',
                            autoIncrement: true,
                        })

                        // Create new indexes
                        newMessagesStore.createIndex('by-from', 'from')
                        newMessagesStore.createIndex('by-to', 'to')
                        newMessagesStore.createIndex('by-group', 'group')

                        // Add all messages with the new schema
                        for (const message of messages) {
                            await newMessagesStore.add({
                                ...message,
                                from: message.userId || '',
                                to: 'all', // default value
                                group: 'all',
                                // Explicitly remove the old field
                                userId: undefined
                            })
                        }
                    } else if (oldVersion === 0) {
                        // Fresh install
                        const messages = db.createObjectStore('messages', {
                            keyPath: 'id',
                            autoIncrement: true,
                        })
                        messages.createIndex('by-from', 'from')
                        messages.createIndex('by-to', 'to')
                        messages.createIndex('by-group', 'group')
                    }
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
        console.log('this.db', this.db)
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

    async findAllMessages(limit: number, offset: number): Promise<MessageStore[]> {
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

    async findMessages(limit: number, id: number, direction: IDBCursorDirection, group: string): Promise<MessageStore[]> {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }

        const messages: MessageStore[] = []
        if (limit < 1) {
            return new Promise((resolve) => resolve(messages))
        }

        const transaction = this.db.transaction('messages', 'readonly')
        const store = transaction.objectStore('messages')

        let cursor = await store.openCursor(null, direction)
        while (cursor) {
            if (!group || (group && cursor.value.group === group)) {
                if (direction === 'prev' ? (cursor.value.id || 0) < id : (cursor.value.id || 0) > id) {
                    limit--
                    messages.push(cursor.value)
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