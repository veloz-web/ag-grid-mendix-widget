interface MxDataActionParams {
    actionname: string;
    applyto: string;
    args?: Record<string, any>;
    guids?: string[];
    xpath?: string;
    constraints?: string;
    sort?: string[][];
}

interface MxDataActionOptions {
    params: MxDataActionParams;
    callback?: (result: any) => void;
    error?: (error: any) => void;
    origin?: any;
}

interface MxData {
    action(options: MxDataActionOptions): void;
}

interface Mx {
    data: MxData;
}

interface Window {
    mx?: Mx;
}
