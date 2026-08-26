CREATE TABLE `private_client_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestType` enum('itinerary','documents','question','support') NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','reviewed','resolved') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `private_client_requests_id` PRIMARY KEY(`id`)
);
