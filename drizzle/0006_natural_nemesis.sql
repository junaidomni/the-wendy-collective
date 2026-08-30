ALTER TABLE `cruise_experiences` ADD `shipFactsJson` text;--> statement-breakpoint
ALTER TABLE `cruise_experiences` ADD `cabinCategoriesJson` text;--> statement-breakpoint
ALTER TABLE `cruise_experiences` ADD `amenitiesJson` text;--> statement-breakpoint
ALTER TABLE `cruise_experiences` ADD `sourceReference` text;--> statement-breakpoint
ALTER TABLE `cruise_experiences` ADD `reviewedOn` varchar(10);--> statement-breakpoint
ALTER TABLE `group_cabin_request_travelers` ADD `dateOfBirth` varchar(10);--> statement-breakpoint
ALTER TABLE `group_cabin_requests` ADD `amenitiesJson` text;