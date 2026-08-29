CREATE TABLE `advisor_deals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('manual','trip_inquiry','group_cabin_request') NOT NULL DEFAULT 'manual',
	`sourceId` int,
	`contactFirstName` varchar(80) NOT NULL,
	`contactLastName` varchar(80) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`title` varchar(180) NOT NULL,
	`travelSummary` text,
	`stage` enum('new_inquiry','discovery_call','building_proposal','proposal_shared','ready_to_book','booked','closed') NOT NULL DEFAULT 'new_inquiry',
	`experienceId` int,
	`nextAction` text,
	`advisorNotes` text,
	`reservationReference` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advisor_deals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealId` int NOT NULL,
	`experienceId` int,
	`title` varchar(180) NOT NULL,
	`privateToken` varchar(96) NOT NULL,
	`summary` text,
	`roomGuidance` text,
	`pricingSummary` text,
	`status` enum('draft','shared','response_received','quoted','booked','expired') NOT NULL DEFAULT 'draft',
	`expiresAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_proposals_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_proposals_privateToken_unique` UNIQUE(`privateToken`)
);
--> statement-breakpoint
CREATE TABLE `cruise_experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(180) NOT NULL,
	`groupName` varchar(180),
	`cruiseLine` varchar(120) NOT NULL,
	`shipName` varchar(160) NOT NULL,
	`embarkPort` varchar(160) NOT NULL,
	`sailingSummary` varchar(180) NOT NULL,
	`heroImageUrl` text,
	`heroImageAlt` varchar(240),
	`publicSummary` text,
	`itineraryJson` text,
	`roomGuidance` text,
	`status` enum('draft','ready','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cruise_experiences_id` PRIMARY KEY(`id`),
	CONSTRAINT `cruise_experiences_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `proposal_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`contactFirstName` varchar(80) NOT NULL,
	`contactLastName` varchar(80) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`roomsJson` text NOT NULL,
	`notes` text,
	`status` enum('new','reviewed','quoted','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proposal_responses_id` PRIMARY KEY(`id`)
);
