
export class LavalinkError extends Error {
    public readonly status: number;
    public readonly error: string;

    constructor(status: number, error: string, message: string) {
        super(message);
        this.name = 'LavalinkError';
        this.status = status;
        this.error = error;
    }
}
