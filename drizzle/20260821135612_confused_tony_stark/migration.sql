-- Rebuilds all three tables to:
--   * store createdAt/updatedAt as real epoch-millisecond integers (they were
--     declared `integer` but held SQLite's "YYYY-MM-DD HH:MM:SS" UTC text),
--   * give every poll an adminToken and a nullable finalizedDate,
--   * make the foreign keys NOT NULL and cascade on delete,
--   * allow only one availability row per participant.
--
-- Existing rows are migrated rather than dropped: timestamps are converted
-- from the old text form, and adminToken is backfilled with fresh randomness
-- (pre-existing polls have no creator device, so nothing is losing a token).

PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_polls` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`slug` text NOT NULL UNIQUE,
	`adminToken` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`dates` text DEFAULT (json_array()) NOT NULL,
	`finalizedDate` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_polls`(`id`, `slug`, `adminToken`, `title`, `description`, `dates`, `finalizedDate`, `createdAt`, `updatedAt`)
SELECT
	`id`,
	`slug`,
	lower(hex(randomblob(16))),
	`title`,
	`description`,
	`dates`,
	NULL,
	COALESCE(
		CASE WHEN typeof(`createdAt`) = 'integer' THEN `createdAt`
		     ELSE CAST(strftime('%s', `createdAt`) AS INTEGER) * 1000 END,
		CAST(strftime('%s', 'now') AS INTEGER) * 1000
	),
	COALESCE(
		CASE WHEN typeof(`updatedAt`) = 'integer' THEN `updatedAt`
		     ELSE CAST(strftime('%s', `updatedAt`) AS INTEGER) * 1000 END,
		CAST(strftime('%s', 'now') AS INTEGER) * 1000
	)
FROM `polls`;--> statement-breakpoint
DROP TABLE `polls`;--> statement-breakpoint
ALTER TABLE `__new_polls` RENAME TO `polls`;--> statement-breakpoint
CREATE TABLE `__new_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`pollId` integer NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer NOT NULL,
	CONSTRAINT `fk_participants_pollId_polls_id_fk` FOREIGN KEY (`pollId`) REFERENCES `polls`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
-- `pollId` is NOT NULL now, so any orphaned rows are dropped on the way across.
INSERT INTO `__new_participants`(`id`, `pollId`, `name`, `createdAt`)
SELECT `id`, `pollId`, `name`, CAST(strftime('%s', 'now') AS INTEGER) * 1000
FROM `participants`
WHERE `pollId` IS NOT NULL
  AND `pollId` IN (SELECT `id` FROM `polls`);--> statement-breakpoint
DROP TABLE `participants`;--> statement-breakpoint
ALTER TABLE `__new_participants` RENAME TO `participants`;--> statement-breakpoint
CREATE TABLE `__new_availabilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`participantId` integer NOT NULL UNIQUE,
	`dates` text DEFAULT (json_array()) NOT NULL,
	`updatedAt` integer NOT NULL,
	CONSTRAINT `fk_availabilities_participantId_participants_id_fk` FOREIGN KEY (`participantId`) REFERENCES `participants`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
-- `participantId` is unique now; keep the most recent row per participant.
INSERT INTO `__new_availabilities`(`id`, `participantId`, `dates`, `updatedAt`)
SELECT `id`, `participantId`, `dates`, CAST(strftime('%s', 'now') AS INTEGER) * 1000
FROM `availabilities`
WHERE `participantId` IS NOT NULL
  AND `participantId` IN (SELECT `id` FROM `participants`)
  AND `id` = (
    SELECT MAX(`inner`.`id`) FROM `availabilities` AS `inner`
    WHERE `inner`.`participantId` = `availabilities`.`participantId`
  );--> statement-breakpoint
DROP TABLE `availabilities`;--> statement-breakpoint
ALTER TABLE `__new_availabilities` RENAME TO `availabilities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
