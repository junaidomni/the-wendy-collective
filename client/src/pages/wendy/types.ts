export const dealStages = ["new_inquiry", "discovery_call", "building_proposal", "proposal_shared", "family_details", "ready_to_book", "booking", "booked", "closed"] as const;
export type DealStage = (typeof dealStages)[number];
export const dealStageLabels: Record<DealStage, string> = { new_inquiry: "New inquiry", discovery_call: "Discovery scheduled", building_proposal: "Proposal build", proposal_shared: "Proposal shared", family_details: "Family details", ready_to_book: "Live quote", booking: "Booking", booked: "Booked", closed: "Closed" };

export const groupStages = ["group_setup", "proposal_build", "ready_to_share", "family_details", "live_quote", "booking", "booked", "closed"] as const;
export type GroupStage = (typeof groupStages)[number];
export const groupStageLabels: Record<GroupStage, string> = { group_setup: "Group setup", proposal_build: "Proposal build", ready_to_share: "Ready to share", family_details: "Family details", live_quote: "Live quote", booking: "Booking", booked: "Booked", closed: "Closed" };

export const groupPipelineStage: Record<GroupStage, DealStage> = { group_setup: "new_inquiry", proposal_build: "building_proposal", ready_to_share: "proposal_shared", family_details: "family_details", live_quote: "ready_to_book", booking: "booking", booked: "booked", closed: "closed" };

export type Deal = { id: number; stage: DealStage; title: string; contactFirstName: string; contactLastName: string; email: string; phone: string; travelSummary: string | null; nextAction: string | null; meetingAt: Date | null; meetingNotes: string | null; advisorNotes: string | null; reservationReference: string | null; experienceId: number | null; createdAt: Date };
export type Experience = { id: number; slug: string; title: string; groupName: string | null; cruiseLine: string; shipName: string; embarkPort: string; sailingSummary: string; heroImageUrl: string | null; heroImageAlt: string | null; publicSummary: string | null; roomGuidance: string | null; itineraryJson: string | null; status: string };
export type Proposal = { id: number; dealId: number; title: string; status: string; expiresAt: Date | null; createdAt: Date; privateToken: string };
export type ProposalResponse = { id: number; proposalId: number; status: "new" | "reviewed" | "quoted" | "closed"; contactFirstName: string; contactLastName: string; email: string; phone: string; roomsJson: string; notes: string | null; createdAt: Date };
export type GroupRequest = { id: number; status: "new" | "contacted" | "details_received" | "quote_in_progress" | "quote_shared" | "booked" | "closed"; contactFirstName: string; contactLastName: string; email: string; phone: string; roomCount: number; rooms: Array<{ id: number; roomNumber: number; occupancy: number; roomType: string; locationPreference: string; travelers: Array<{ id: number; firstName: string; middleName: string | null; lastName: string; age: number }> }>; advisorNotes: string | null; createdAt: Date };
export type GroupProfile = { id: number; groupKey: string; title: string; organizationName: string; stage: GroupStage; shareStatus: "draft" | "shared" | "paused" | "closed"; coordinatorName: string | null; coordinatorEmail: string | null; coordinatorPhone: string | null; groupTerms: string | null; roomStrategy: string | null; bookingWindow: string | null; advisorNotes: string | null; expiresAt: Date | null };
export type GrimsleyProfile = { profile: GroupProfile; experience: Experience | null; cabinRequests: GroupRequest[] };
export type CrmDashboard = { deals: Deal[]; experiences: Experience[]; proposals: Proposal[]; responses: ProposalResponse[]; grimsleyProfile?: GrimsleyProfile };

export function parseItinerary(raw: string | null | undefined): Array<{ day: string; place: string; detail: string }> { try { const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
export function parseRooms(raw: string): Array<{ occupancy: number; roomType: string; locationPreference: string; travelerDetails: Array<{ fullName: string; dateOfBirth: string }> }> { try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
