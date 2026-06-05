-- Case C1: conversas e mensagens
CREATE TABLE "CaseConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'finance',
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseConversation_userId_updatedAt_idx" ON "CaseConversation"("userId", "updatedAt");
CREATE INDEX "CaseMessage_conversationId_createdAt_idx" ON "CaseMessage"("conversationId", "createdAt");

ALTER TABLE "CaseConversation" ADD CONSTRAINT "CaseConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseMessage" ADD CONSTRAINT "CaseMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CaseConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
