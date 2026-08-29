import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import About from "./About";
import DestinationGuide from "./DestinationGuide";
import Destinations from "./Destinations";
import Faq from "./Faq";
import Home from "./Home";
import Privacy from "./Privacy";
import { destinationGuides } from "../lib/destinationGuides";

function renderPage(page: React.ReactElement, path = "/") {
  return renderToStaticMarkup(<Router hook={() => [path, () => undefined]}>{page}</Router>);
}

describe("public site content", () => {
  it("renders the homepage promise, Why Choose Wendy content, and consultation path", () => {
    const page = renderPage(<Home />);
    expect(page).toContain("Let’s plan a journey");
    expect(page).toContain("I love discovering beautiful places, memorable hotels, local flavors, and the details that make a trip feel truly special.");
    expect(page).toContain("Why choose Wendy");
    expect(page).toContain("Plan Your Journey");
    expect(page).toContain("/contact");
  });

  it("keeps visitor-facing copy free of dash punctuation", () => {
    const publicText = [
      renderPage(<Home />),
      renderPage(<About />),
      renderPage(<Destinations />),
      renderPage(<Faq />),
      renderPage(<Privacy />),
      renderPage(<DestinationGuide />, "/destinations/caribbean"),
    ].join(" ").replace(/<[^>]*>/g, " ");
    const destinationCopy = destinationGuides.flatMap((guide) => [guide.label, guide.title, guide.italic, guide.summary, guide.imageAlt, guide.planningNote, guide.inquiryLabel, ...guide.idealFor, ...guide.moments]).join(" ");
    expect(`${publicText} ${destinationCopy}`).not.toMatch(/[—–]/);
    expect(`${publicText} ${destinationCopy}`).not.toMatch(/\b[A-Za-z]+-[A-Za-z]+\b/);
  });

  it("keeps contact and private-experience messaging free of dash punctuation", () => {
    const extractJsxText = (source: string) => Array.from(source.matchAll(/>([^<>{]+)</g)).map((match) => match[1]).join(" ");
    const clientAreaText = [
      readFileSync(new URL("./Contact.tsx", import.meta.url), "utf8"),
      readFileSync(new URL("./PrivateExperience.tsx", import.meta.url), "utf8"),
    ].map(extractJsxText).join(" ");
    expect(clientAreaText).not.toMatch(/[—–]/);
    expect(clientAreaText).not.toMatch(/\b[A-Za-z]+-[A-Za-z]+\b/);
  });

  it("renders the approved public information architecture", () => {
    const about = renderPage(<About />);
    const destinations = renderPage(<Destinations />);
    const faq = renderPage(<Faq />);
    const guide = renderPage(<DestinationGuide />, "/destinations/caribbean");
    expect(about).toContain("A travel advisor with a");
    expect(destinations).toContain("Explore the collections");
    expect(destinations).toContain("All Inclusive Escapes");
    expect(faq).toContain("How much do your services cost?");
    expect(faq).toContain("How do you get paid if it’s free?");
    expect(faq).toContain("My services are completely free to you.");
    expect(guide).toContain("Caribbean, at your");
    expect(guide).toContain("Plan a Caribbean escape");
    expect(guide).toContain("/contact?type=caribbean&amp;destination=Caribbean&amp;guide=caribbean");
    expect(guide).toContain("aria-current=\"page\"");
  });

  it("renders the branded school cruise and keeps the request advisor-led", () => {
    const schoolCruise = readFileSync(new URL("./SchoolCruise.tsx", import.meta.url), "utf8");
    expect(schoolCruise).toContain("Grimsley High School");
    expect(schoolCruise).toContain("Graduation Cruise.");
    expect(schoolCruise).toContain("Request your cabin");
    expect(schoolCruise).toContain("Forward");
    expect(schoolCruise).toContain("Mid ship");
    expect(schoolCruise).toContain("does not hold a cabin or create a reservation");
    expect(schoolCruise).not.toMatch(/[—–]/);
  });

  it("keeps semantic navigation and headings in the public experience", () => {
    const page = renderPage(<Home />);
    const guide = renderPage(<DestinationGuide />, "/destinations/caribbean");
    expect(page).toContain("<nav");
    expect(page).toContain("aria-label=\"Primary navigation\"");
    expect(page).toContain("<main");
    expect(page).toContain("<h1");
    expect(page).toContain("/destinations/caribbean");
    expect(page).toContain("/destinations/mexico");
    expect(page).toContain("/destinations/cruises");
    expect(page).toContain("/destinations/all-inclusive");
    expect(page).toContain("/destinations/groups");
    expect(page).toContain("/contact?type=custom");
    const destinationsNavigation = guide.match(/<a[^>]*href="\/destinations"[^>]*>Destinations<\/a>/)?.[0] ?? "";
    expect(destinationsNavigation).toContain("nav-link--active");
    expect(destinationsNavigation).toContain("aria-current=\"page\"");
  });

  it("renders the privacy policy and publishes focused indexing artifacts", () => {
    const privacy = renderPage(<Privacy />, "/privacy");
    const robots = readFileSync(new URL("../../public/robots.txt", import.meta.url), "utf8");
    const sitemap = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
    expect(privacy).toContain("Privacy policy");
    expect(privacy).toContain("Information you share");
    expect(privacy).toContain("We do not sell your personal information.");
    expect(robots).toContain("Disallow: /wendy");
    expect(robots).toContain("Sitemap:");
    expect(sitemap).toContain("/destinations/caribbean");
    expect(sitemap).toContain("/privacy");
    expect(sitemap).toContain("/experiences/grimsley-hs-graduation-cruise-2027");
  });
});
