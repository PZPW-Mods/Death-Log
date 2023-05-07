import { onClientCommand } from "@asledgehammer/pipewrench-events";
import { IPlayerLog } from "../../shared/player-death-logging/player-log";
import { IPlayerInventory } from "../../shared/player-death-logging/player-inventory";
import { getFileWriter } from "@asledgehammer/pipewrench";

function appendText(text: string) {
    const writer = getFileWriter('player-death-logging.log', true, true);
    writer.writeln(text);
    writer.close();
}

function printItem(item: IPlayerInventory, depth: number) {
    const indentation = '  '.repeat(depth);
    appendText(`${indentation}${item.name}${(item.equipped) ? '*' : ''} (${item.type}) ${(item.count !== undefined) ? `(x${item.count})` : ''}`);

    if (item.container !== undefined) {
        item.container.forEach((containerItem) => {
            printItem(containerItem, depth + 2);
        });
    }
}

function printLog(log: IPlayerLog) {
    appendText(``);
    appendText(`Username: ${log.username ?? "Unknown"}`);
    appendText(`SteamID: ${log.steamId ?? "Unknown"}`);
    appendText(`Character Name: ${log.characterName ?? "Unknown"}`);
    appendText(`Character Gender: ${log.gender ?? "Unknown"}`);
    appendText(`Character Profession: ${log.profession ?? "Unknown"}`);
    appendText(`Death Cause: ${log.deathCause ?? "Unknown"}`);
    appendText(`Zombie Kills: ${log.zombieKills ?? 0}`);
    appendText(`Survived Time: ${log.survivedTime}`);
    appendText(`Position: X: ${log.position.x}, Y: ${log.position.y}, Z: ${log.position.z}`);
    appendText(`Game Date Time: ${log.gameDateTime.year}-${log.gameDateTime.month}-${log.gameDateTime.day} ${log.gameDateTime.hour}:${log.gameDateTime.minute}`);
    appendText(`Traits:`);
    log.traits?.forEach((trait) => appendText(`  ${trait}`));
    appendText(`Skills:`);
    log.skills?.forEach((skill) => appendText(`  ${skill.skill} (${skill.level})`));
    appendText(`Inventory:`);
    log.inventory?.forEach((item) => printItem(item, 2));
    appendText(``);
    appendText(`=================================`)
    appendText(``);
}

onClientCommand.addListener((module, command, player, args) => {
    if (module !== "PlayerDeathLogging") return;

    if (command === "logPlayerDeath") {
        const playerLog: IPlayerLog = args;
        
        printLog(playerLog);
    }
});