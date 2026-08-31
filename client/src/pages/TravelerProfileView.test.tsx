import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({ getProfile: vi.fn(), submitProfile: vi.fn() }));

vi.mock("wouter", () => ({ useLocation: () => ["/traveler-profile/nO2cJ2DLexS4dd7zxjgTLRwODnP0CZ5oOQgZkpt4pWk", vi.fn()] }));
vi.mock("@/components/SiteShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/lib/trpc", () => ({ trpc: { crm: { getTravelerProfile: { useQuery: () => mocks.getProfile() }, submitTravelerProfile: { useMutation: () => mocks.submitProfile() } } } }));

import TravelerProfileView from "./TravelerProfileView";

describe("private traveler profile", () => {
  it("renders a private planning intake without payment, passport, password, or medical fields", () => {
    mocks.getProfile.mockReturnValue({ isLoading: false, data: { deal: { id: 51, title: "Anniversary escape", contactFirstName: "Alex", contactLastName: "Morgan", email: "alex@example.com", phone: "555-010-1020" } } });
    mocks.submitProfile.mockReturnValue({ data: undefined, isPending: false, mutate: vi.fn(), error: undefined });
    const html = renderToStaticMarkup(<TravelerProfileView />);
    expect(html).toContain("Your traveler profile");
    expect(html).toContain("Date of birth");
    expect(html).toContain("Loyalty number if available");
    expect(html).toContain("Accessibility or mobility notes");
    expect(html).toContain("Do not enter payment cards, passport details, account passwords, or medical information.");
    expect(html).not.toMatch(/name="(?:cardNumber|passportNumber|password|medicalHistory)"/i);
  });
});
