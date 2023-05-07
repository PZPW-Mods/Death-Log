import { IPlayerInventory } from "./player-inventory";

export interface IPlayerLog {
    username: string;
    steamId: number;
    characterName: string;
    gender: "Male" | "Female";
    profession: string;
    deathCause: string;
    zombieKills: number;
    survivedTime: string;
    traits: string[];
    skills: {skill: string, level: number}[];
    position: {
        x: number;
        y: number;
        z: number;
    };
    gameDateTime: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
    };
    inventory: IPlayerInventory[] | undefined;
}
