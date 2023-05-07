export interface IPlayerInventory {
    name: string;
    type: string;
    count?: number;
    equipped: boolean;
    container?: IPlayerInventory[];
}
