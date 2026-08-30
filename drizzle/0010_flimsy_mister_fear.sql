ALTER TABLE `group_cabin_request_rooms` ADD `selectedCabinCategory` varchar(180);--> statement-breakpoint
ALTER TABLE `group_cabin_request_rooms` ADD `estimatedFareCents` int;--> statement-breakpoint
ALTER TABLE `group_cabin_request_rooms` ADD `estimatedGratuitiesCents` int;--> statement-breakpoint
ALTER TABLE `group_cabin_request_rooms` ADD `estimatedProtectionCents` int;--> statement-breakpoint
ALTER TABLE `group_cabin_requests` ADD `extrasJson` text;--> statement-breakpoint
ALTER TABLE `group_cabin_requests` ADD `estimateJson` text;