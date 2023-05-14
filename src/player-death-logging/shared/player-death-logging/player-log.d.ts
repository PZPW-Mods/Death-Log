import { IPlayerInventory } from "./player-inventory";

export interface IPlayerLog {
    username: string;
    steamId: string;
    steamName: string;
    characterName: string;
    gender: "Male" | "Female";
    profession: string;
    infected: boolean;
    deathCause: string;
    zombieKills: number;
    survivedTime: string;
    favoriteWeapon: string;
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
