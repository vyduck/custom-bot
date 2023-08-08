import { cooldown,createCooldown } from "better-cooldown";

export interface cooldownManager {
    users: Map<string, cooldown>;
    limit: number;
    period: number;

    tick: Function;
}

export function createCooldownManager(limitPerMin: number, period: number = 60) {
    const manager = {
        users: new Map(),
        limit: limitPerMin,
        period: period,

        tick(userId: string) {
            let userCooldown = manager.users.get(userId);
            if (!userCooldown) {
                userCooldown = createCooldown(manager.limit, manager.period);
                manager.users.set(
                    userId,
                    userCooldown
                );
            };

            return userCooldown.tick()

        }
    };
    return manager;
}