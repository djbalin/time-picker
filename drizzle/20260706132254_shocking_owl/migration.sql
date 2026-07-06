CREATE TABLE `availabilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`participantId` integer,
	`dates` text DEFAULT (json_array()) NOT NULL,
	CONSTRAINT `fk_availabilities_participantId_participants_id_fk` FOREIGN KEY (`participantId`) REFERENCES `participants`(`id`)
);
--> statement-breakpoint
ALTER TABLE `polls` ADD `slug` text DEFAULT (lower(hex(randomblob(8)))) NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_polls` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`title` text NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`dates` text DEFAULT (json_array()) NOT NULL,
	`slug` text DEFAULT (lower(hex(randomblob(8)))) NOT NULL UNIQUE
);
--> statement-breakpoint
INSERT INTO `__new_polls`(`id`, `title`, `description`, `createdAt`, `updatedAt`, `dates`) SELECT `id`, `title`, `description`, `createdAt`, `updatedAt`, `dates` FROM `polls`;--> statement-breakpoint
DROP TABLE `polls`;--> statement-breakpoint
ALTER TABLE `__new_polls` RENAME TO `polls`;--> statement-breakpoint
PRAGMA foreign_keys=ON;