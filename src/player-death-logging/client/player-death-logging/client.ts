import { InventoryContainer, InventoryItem, IsoPlayer, ItemContainer, Perk, PerkInfo, Perks, _instanceof_, getGameTime, sendClientCommand } from "@asledgehammer/pipewrench";
import { onPlayerDeath } from "@asledgehammer/pipewrench-events";
import { IPlayerLog } from "../../shared/player-death-logging/player-log";
import { IPlayerInventory } from "../../shared/player-death-logging/player-inventory";

function printItem(item: IPlayerInventory, depth: number) {
    const indentation = '  '.repeat(depth);
    print(`${indentation}${item.name}${(item.equipped) ? '*' : ''} (${item.type}) ${(item.count !== undefined) ? `(x${item.count})` : ''}`);

    if (item.container !== undefined) {
        item.container.forEach((containerItem) => {
            printItem(containerItem, depth + 2);
        });
    }
}

function printLog(log: IPlayerLog) {
    print(``);
    print(`PLAYER DEATH LOG`);
    print(`Username: ${log.username ?? "Unknown"}`);
    print(`SteamID: ${log.steamId ?? "Unknown"}`);
    print(`Character Name: ${log.characterName ?? "Unknown"}`);
    print(`Character Gender: ${log.gender ?? "Unknown"}`);
    print(`Character Profession: ${log.profession ?? "Unknown"}`);
    print(`Death Cause: ${log.deathCause ?? "Unknown"}`);
    print(`Zombie Kills: ${log.zombieKills ?? 0}`);
    print(`Survived Time: ${log.survivedTime}`);
    print(`Position: X: ${log.position.x}, Y: ${log.position.y}, Z: ${log.position.z}`);
    print(`Game Date Time: ${log.gameDateTime.year}-${log.gameDateTime.month}-${log.gameDateTime.day} ${log.gameDateTime.hour}:${log.gameDateTime.minute}`);
    print(`Traits:`);
    log.traits?.forEach((trait) => print(`  ${trait}`));
    print(`Skills:`);
    log.skills?.forEach((skill) => print(`  ${skill.skill} (${skill.level})`));
    print(`Inventory:`);
    log.inventory?.forEach((item) => printItem(item, 2));
    print(``);
    print(`=================================`)
    print(``);
}

function getItemsInContainer(container: ItemContainer) {
    if (_instanceof_(container, "ItemContainer") === false) return undefined;
    
    const arr: IPlayerInventory[] = [];
    const items = container.getItems();
    for (let i = 0; i < items.size(); i++) {
        const item: InventoryItem = items.get(i);
        const iitem: IPlayerInventory = {
            name: item.getName(),
            type: item.getFullType(),
            equipped: item.isEquipped(),
            container: (item.IsInventoryContainer() === true) ? getItemsInContainer((item as InventoryContainer).getItemContainer()) : undefined,
        };
        const existingItem = arr.find(i => i.name === iitem.name && i.type === iitem.type);
        if (existingItem !== undefined)
            existingItem.count = (existingItem.count ?? 1) + 1;
        else
            arr.push(iitem);
    }
    return arr;
}

onPlayerDeath.addListener((player) => {
    const traits: string[] = [];
    for (let i = 0; i < player.getTraits().size(); i++) {
        traits.push(player.getTraits().get(i));
    }

    const skills: {skill: string, level: number}[] = [];
    for (let i = 0; i < Perks.getMaxIndex(); i++) {
        const perk: Perk = Perks.fromIndex(i);
        const level = player.getPerkLevel(perk);
        if (level > 0) {
            skills.push({
                skill: perk.getName(),
                level: player.getPerkLevel(perk),
            });
        }
    }

    let deathCause = 'Unknown';
    const killer = player.getAttackedBy();
    if (killer !== undefined) {
        if (_instanceof_(killer, "IsoZombie") === true) {
            deathCause = 'Zombie';
        }
        else if (_instanceof_(killer, "IsoPlayer") === true) {
            deathCause = `Player (${(killer as IsoPlayer).getUsername()})`;
        }
    }
    
    const playerLog: IPlayerLog = {
        username: player.getUsername(),
        steamId: string.format("%.0f", player.getSteamID()),
        characterName: player.getFullName(),
        gender: player.isFemale() ? 'Female' : 'Male',
        profession: player.getDescriptor().getProfession() ?? "Unknown",
        deathCause,
        zombieKills: player.getZombieKills() ?? 0,
        survivedTime: player.getTimeSurvived(),
        position: {
            x: player.getX(),
            y: player.getY(),
            z: player.getZ(),
        },
        gameDateTime: {
            year: getGameTime().getYear(),
            month: getGameTime().getMonth() + 1,
            day: getGameTime().getDay() + 1,
            hour: getGameTime().getHour(),
            minute: getGameTime().getMinutes(),
        },
        traits,
        skills,
        inventory: getItemsInContainer(player.getInventory()),
    };

    printLog(playerLog);
    
    sendClientCommand("PlayerDeathLogging", "logPlayerDeath", playerLog);
});
