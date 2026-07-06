CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`pollId` integer,
	`name` text NOT NULL,
	CONSTRAINT `fk_participants_pollId_polls_id_fk` FOREIGN KEY (`pollId`) REFERENCES `polls`(`id`)
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_polls` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`title` text NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`dates` text DEFAULT (json_array()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_polls`(`id`, `title`, `description`, `createdAt`, `updatedAt`, `dates`) SELECT `id`, `title`, `description`, `createdAt`, `updatedAt`, `dates` FROM `polls`;--> statement-breakpoint
DROP TABLE `polls`;--> statement-breakpoint
ALTER TABLE `__new_polls` RENAME TO `polls`;--> statement-breakpoint
PRAGMA foreign_keys=ON;