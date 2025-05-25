interface MessageChat {
    from: string;
    to: string;
    content: string;
    id: string;
}

interface MessageFile {
    from: string;
    to: string;
    fileName: string;
    fileType: string;
    fileData: ArrayBuffer;
    id: string;
}


interface FileData {
    name: string;
    type: string;
    data: ArrayBuffer;
}