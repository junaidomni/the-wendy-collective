CREATE TABLE `trip_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(80) NOT NULL,
	`lastName` varchar(80) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`travelType` varchar(40) NOT NULL,
	`destinations` text NOT NULL,
	`travelTiming` varchar(120) NOT NULL,
	`dateFlexibility` varchar(24) NOT NULL,
	`budget` varchar(120) NOT NULL,
	`groupSize` int NOT NULL,
	`priorities` text,
	`status` enum('new','reviewed','planned') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trip_inquiries_id` PRIMARY KEY(`id`)
);
