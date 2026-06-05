-- LifeOS RPG Shop: LifeCoins store + cosmetic titles/avatars

ALTER TABLE "UserGameProfile"
  ADD COLUMN "displayTitle" TEXT;

CREATE TYPE "ShopItemType" AS ENUM ('TITLE', 'AVATAR');

CREATE TABLE "ShopItemDefinition" (
    "id" TEXT NOT NULL,
    "type" "ShopItemType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "payload" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "minPrestige" INTEGER NOT NULL DEFAULT 0,
    "requiresAchievementId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShopItemDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserShopItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserShopItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserShopItem_userId_itemId_key" ON "UserShopItem"("userId", "itemId");
CREATE INDEX "UserShopItem_userId_idx" ON "UserShopItem"("userId");

ALTER TABLE "UserShopItem" ADD CONSTRAINT "UserShopItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserShopItem" ADD CONSTRAINT "UserShopItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ShopItemDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
