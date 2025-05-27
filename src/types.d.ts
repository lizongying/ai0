interface MessageOpen {
    from: string;
    to: string;
}

interface MessageClose {
    from: string;
    to: string;
}

interface MessageStatus {
    from: string;
    to: string;
    status: string;
}

interface MessageChat {
    id?: string;
    from: string;
    to: string;
    data: string;
}

interface MessageFile {
    id?: string;
    from: string;
    to: string;
    fileName: string;
    fileType: string;
    fileData: ArrayBuffer;
}


interface FileData {
    name: string;
    type: string;
    data: ArrayBuffer;
}