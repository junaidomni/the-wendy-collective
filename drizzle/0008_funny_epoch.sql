CREATE TABLE `workflow_stage_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('deal','group') NOT NULL,
	`entityId` int NOT NULL,
	`fromStage` varchar(64),
	`toStage` varchar(64) NOT NULL,
	`action` varchar(96) NOT NULL,
	`reason` text,
	`snapshotJson` text,
	`actorUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_stage_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `advisor_deals` MODIFY COLUMN `stage` enum('new_inquiry','discovery_call','building_proposal','proposal_shared','family_details','ready_to_book','booking','booked','closed') NOT NULL DEFAULT 'new_inquiry';--> statement-breakpoint
ALTER TABLE `advisor_deals` ADD `stageDataJson` text;--> statement-breakpoint
ALTER TABLE `group_travel_profiles` ADD `stageDataJson` text;