CREATE TABLE `advisor_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('public_inquiry','group_request','proposal_response') NOT NULL,
	`sourceId` int NOT NULL,
	`groupKey` varchar(120),
	`title` varchar(180) NOT NULL,
	`detail` text NOT NULL,
	`href` varchar(320) NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advisor_alerts_id` PRIMARY KEY(`id`)
);
