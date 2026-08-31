CREATE TABLE `advisor_research_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealId` int NOT NULL,
	`optionType` enum('cruise','resort','tour','custom') NOT NULL DEFAULT 'cruise',
	`title` varchar(180) NOT NULL,
	`provider` varchar(120),
	`shipOrProperty` varchar(180),
	`destination` varchar(180),
	`travelDates` varchar(180),
	`departurePort` varchar(180),
	`itinerarySummary` text,
	`sourceReference` text,
	`reviewedOn` varchar(10),
	`clientFit` text,
	`advisorNotes` text,
	`status` enum('researching','ready_to_review','presented','selected','not_selected') NOT NULL DEFAULT 'researching',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advisor_research_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traveler_profile_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dealId` int NOT NULL,
	`privateToken` varchar(96) NOT NULL,
	`status` enum('draft','shared','response_received','closed') NOT NULL DEFAULT 'draft',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `traveler_profile_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `traveler_profile_links_privateToken_unique` UNIQUE(`privateToken`)
);
--> statement-breakpoint
CREATE TABLE `traveler_profile_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`travelerProfileLinkId` int NOT NULL,
	`contactFirstName` varchar(80) NOT NULL,
	`contactLastName` varchar(80) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`travelerDetailsJson` text NOT NULL,
	`travelPreferencesJson` text NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traveler_profile_responses_id` PRIMARY KEY(`id`)
);
