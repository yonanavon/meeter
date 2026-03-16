-- AlterTable
ALTER TABLE "Class" ADD COLUMN "whatsappJid" TEXT;

-- CreateTable
CREATE TABLE "whatsapp_sessions" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "stickers" (
    "id" SERIAL NOT NULL,
    "base64" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL DEFAULT 'image/webp',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stickers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_rules" (
    "id" SERIAL NOT NULL,
    "minutesBefore" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "stickerId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "reminder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_logs" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "groupJid" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_sessions_key_key" ON "whatsapp_sessions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_logs_assignmentId_ruleId_key" ON "reminder_logs"("assignmentId", "ruleId");

-- AddForeignKey
ALTER TABLE "reminder_rules" ADD CONSTRAINT "reminder_rules_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "stickers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
