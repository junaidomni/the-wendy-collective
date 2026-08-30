CREATE TABLE `group_family_portals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupKey` varchar(120) NOT NULL,
	`portalToken` varchar(96) NOT NULL,
	`currentRequestId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `group_family_portals_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_family_portals_portalToken_unique` UNIQUE(`portalToken`)
);
--> statement-breakpoint
ALTER TABLE `group_cabin_requests` ADD `familyPortalId` int;--> statement-breakpoint
ALTER TABLE `group_cabin_requests` ADD `revisionNumber` int DEFAULT 1 NOT NULL;