CREATE TABLE `group_cabin_request_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cabinRequestId` int NOT NULL,
	`roomNumber` int NOT NULL,
	`occupancy` int NOT NULL,
	`roomType` varchar(40) NOT NULL,
	`locationPreference` varchar(40) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_cabin_request_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_cabin_request_travelers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`firstName` varchar(80) NOT NULL,
	`middleName` varchar(80),
	`lastName` varchar(80) NOT NULL,
	`age` int NOT NULL,
	`loyaltyNumber` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_cabin_request_travelers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_cabin_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupKey` varchar(120) NOT NULL,
	`contactFirstName` varchar(80) NOT NULL,
	`contactLastName` varchar(80) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`roomCount` int NOT NULL,
	`notes` text,
	`status` enum('new','contacted','details_received','quote_in_progress','quote_shared','booked','closed') NOT NULL DEFAULT 'new',
	`advisorNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `group_cabin_requests_id` PRIMARY KEY(`id`)
);
