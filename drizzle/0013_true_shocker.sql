CREATE TABLE `advisor_appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`durationMinutes` int NOT NULL,
	`attendeeName` varchar(180) NOT NULL,
	`attendeeEmail` varchar(320) NOT NULL,
	`attendeePhone` varchar(40),
	`clientMessage` text,
	`advisorNotes` text,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`calendarSyncStatus` enum('not_connected','ready_to_sync','synced','sync_failed') NOT NULL DEFAULT 'not_connected',
	`externalCalendarEventId` varchar(240),
	`meetingUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advisor_appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `advisor_availability_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`status` enum('available','unavailable') NOT NULL DEFAULT 'unavailable',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advisor_availability_blocks_id` PRIMARY KEY(`id`)
);
