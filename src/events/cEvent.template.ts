export interface cEvent {
    name: string;
    exec: Function;
    once?: boolean;
}