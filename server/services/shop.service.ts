import type { PrismaClient, ShopItemDefinition } from "@prisma/client";
import { z } from "zod";

import { AppError } from "../middlewares/error.middleware";
import { levelProgress } from "../gamification/levels";
import { SHOP_ITEMS } from "../gamification/shop-catalog";
import type { GamificationEngine } from "../gamification/engine";

const purchaseSchema = z.object({
  itemId: z.string().min(1),
  equip: z.boolean().optional().default(false),
});

const equipSchema = z.object({
  itemId: z.string().min(1),
});

export class ShopService {
  private catalogEnsured = false;

  constructor(
    private prisma: PrismaClient,
    private engine: GamificationEngine
  ) {}

  parsePurchase(raw: unknown) {
    return purchaseSchema.parse(raw);
  }

  parseEquip(raw: unknown) {
    return equipSchema.parse(raw);
  }

  async ensureCatalog() {
    if (this.catalogEnsured) return;

    await Promise.all(
      SHOP_ITEMS.map((item) =>
        this.prisma.shopItemDefinition.upsert({
          where: { id: item.id },
          create: {
            ...item,
            requiresAchievementId: item.requiresAchievementId ?? null,
          },
          update: {
            type: item.type,
            label: item.label,
            description: item.description,
            icon: item.icon,
            price: item.price,
            rarity: item.rarity,
            payload: item.payload,
            minLevel: item.minLevel,
            minPrestige: item.minPrestige,
            requiresAchievementId: item.requiresAchievementId ?? null,
            sortOrder: item.sortOrder,
          },
        })
      )
    );

    this.catalogEnsured = true;
  }

  async getShop(userId: string) {
    await this.ensureCatalog();
    const profile = await this.engine.loadProfile(userId);
    const progress = levelProgress(profile.totalXp);

    const [items, owned, achievements] = await Promise.all([
      this.prisma.shopItemDefinition.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      }),
      this.prisma.userShopItem.findMany({
        where: { userId },
        select: { itemId: true },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
    ]);

    const ownedIds = new Set(owned.map((row) => row.itemId));
    const achievementIds = new Set(achievements.map((row) => row.achievementId));

    return {
      balance: {
        lifeCoins: profile.lifeCoins,
        lifetimeCoins: profile.lifetimeCoins,
      },
      equipped: {
        avatarIcon: profile.avatarIcon,
        displayTitle: profile.displayTitle,
      },
      items: items.map((item) =>
        this.mapShopItem(item, {
          level: progress.level,
          prestige: profile.prestigeLevel,
          ownedIds,
          achievementIds,
          profile,
        })
      ),
    };
  }

  async purchase(userId: string, itemId: string, equip = false) {
    await this.ensureCatalog();
    const item = await this.prisma.shopItemDefinition.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Item não encontrado na loja.",
      });
    }

    const profile = await this.engine.loadProfile(userId);
    const progress = levelProgress(profile.totalXp);
    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const achievementIds = new Set(achievements.map((row) => row.achievementId));

    const lock = this.lockReason(item, {
      level: progress.level,
      prestige: profile.prestigeLevel,
      achievementIds,
    });
    if (lock) {
      throw new AppError(409, { code: "CONFLICT", message: lock });
    }
    if (profile.lifeCoins < item.price) {
      throw new AppError(409, {
        code: "CONFLICT",
        message: "LifeCoins insuficientes.",
      });
    }

    const existing = await this.prisma.userShopItem.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });
    if (existing) {
      throw new AppError(409, {
        code: "CONFLICT",
        message: "Já possuis este item.",
      });
    }

    await this.prisma.$transaction(async (tx) => {
      const debit = await tx.userGameProfile.updateMany({
        where: { userId, lifeCoins: { gte: item.price } },
        data: { lifeCoins: { decrement: item.price } },
      });
      if (debit.count === 0) {
        throw new AppError(409, {
          code: "CONFLICT",
          message: "LifeCoins insuficientes.",
        });
      }

      await tx.userShopItem.create({
        data: { userId, itemId },
      });

      if (equip) {
        await this.applyEquipTx(tx, userId, item);
      }
    });

    return this.buildActionResponse(userId, item, equip);
  }

  async equip(userId: string, itemId: string) {
    await this.ensureCatalog();

    const [item, owned] = await Promise.all([
      this.prisma.shopItemDefinition.findUnique({ where: { id: itemId } }),
      this.prisma.userShopItem.findUnique({
        where: { userId_itemId: { userId, itemId } },
      }),
    ]);

    if (!item) {
      throw new AppError(404, {
        code: "NOT_FOUND",
        message: "Item não encontrado.",
      });
    }
    if (!owned) {
      throw new AppError(409, {
        code: "CONFLICT",
        message: "Precisas de comprar este item antes de o equipar.",
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await this.applyEquipTx(tx, userId, item);
    });

    return this.buildActionResponse(userId, item, true);
  }

  private async buildActionResponse(
    userId: string,
    item: ShopItemDefinition,
    equippedNow: boolean
  ) {
    const shop = await this.getShop(userId);
    return {
      balance: shop.balance,
      equipped: shop.equipped,
      purchase: {
        itemId: item.id,
        label: item.label,
        type: item.type,
      },
      equippedNow,
      items: shop.items,
    };
  }

  private mapShopItem(
    item: ShopItemDefinition,
    ctx: {
      level: number;
      prestige: number;
      ownedIds: Set<string>;
      achievementIds: Set<string>;
      profile: { avatarIcon: string; displayTitle: string | null };
    }
  ) {
    const owned = ctx.ownedIds.has(item.id);
    const lock = this.lockReason(item, ctx);

    const equipped =
      item.type === "TITLE"
        ? ctx.profile.displayTitle === item.payload
        : ctx.profile.avatarIcon === item.payload;

    return {
      id: item.id,
      type: item.type,
      label: item.label,
      description: item.description,
      icon: item.icon,
      price: item.price,
      rarity: item.rarity,
      payload: item.payload,
      minLevel: item.minLevel,
      minPrestige: item.minPrestige,
      locked: Boolean(lock),
      lockReason: lock ?? undefined,
      owned,
      equipped,
    };
  }

  private lockReason(
    item: ShopItemDefinition,
    ctx: {
      level: number;
      prestige: number;
      achievementIds: Set<string>;
    }
  ): string | null {
    if (ctx.level < item.minLevel) {
      return `Requer nível ${item.minLevel}`;
    }
    if (ctx.prestige < item.minPrestige) {
      return `Requer prestige ${item.minPrestige}`;
    }
    if (
      item.requiresAchievementId &&
      !ctx.achievementIds.has(item.requiresAchievementId)
    ) {
      return "Conquista necessária em falta";
    }
    return null;
  }

  private async applyEquipTx(
    tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0],
    userId: string,
    item: ShopItemDefinition
  ) {
    if (item.type === "TITLE") {
      await tx.userGameProfile.update({
        where: { userId },
        data: { displayTitle: item.payload },
      });
      return;
    }

    await tx.userGameProfile.update({
      where: { userId },
      data: { avatarIcon: item.payload },
    });
  }
}
