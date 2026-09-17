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
  return renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{page}</Router>
  );
}

describe("public site content", () => {
  it("renders the homepage promise, Why Choose Wendy content, and consultation path", () => {
    const page = renderPage(<Home />);
    expect(page).toContain("Let’s plan a journey");
    expect(page).toContain(
      "I love discovering beautiful places, memorable hotels, local flavors, and the details that make a trip feel truly special."
    );
    expect(page).toContain("Why choose Wendy");
    expect(page).toContain("Plan Your Journey");
    expect(page).toContain("/contact");
  });

  it("removes decorative sequence numbers from public image treatments", () => {
    const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
    const destinationsSource = readFileSync(new URL("./Destinations.tsx", import.meta.url), "utf8");
    const guideSource = readFileSync(new URL("./DestinationGuide.tsx", import.meta.url), "utf8");

    expect(homeSource).not.toContain("experience-card__index");
    expect(homeSource).not.toContain('aria-hidden="true">01</span>');
    expect(destinationsSource).not.toContain("guide.number");
    expect(destinationsSource).toContain("{guide.label}");
    expect(guideSource).not.toContain("guide.number");
    expect(destinationGuides.every(guide => !("number" in guide))).toBe(true);
  });

  it("keeps visitor-facing copy free of dash punctuation", () => {
    const publicText = [
      renderPage(<Home />),
      renderPage(<About />),
      renderPage(<Destinations />),
      renderPage(<Faq />),
      renderPage(<Privacy />),
      renderPage(<DestinationGuide />, "/destinations/caribbean"),
    ]
      .join(" ")
      .replace(/<[^>]*>/g, " ");
    const destinationCopy = destinationGuides
      .flatMap(guide => [
        guide.label,
        guide.title,
        guide.italic,
        guide.summary,
        guide.imageAlt,
        guide.planningNote,
        guide.inquiryLabel,
        ...guide.idealFor,
        ...guide.moments,
      ])
      .join(" ");
    expect(`${publicText} ${destinationCopy}`).not.toMatch(/[—–]/);
    expect(`${publicText} ${destinationCopy}`).not.toMatch(
      /\b[A-Za-z]+-[A-Za-z]+\b/
    );
  });

  it("keeps contact and private-experience messaging free of dash punctuation", () => {
    const extractJsxText = (source: string) =>
      Array.from(source.matchAll(/>([^<>{]+)</g))
        .map(match => match[1])
        .join(" ");
    const clientAreaText = [
      readFileSync(new URL("./Contact.tsx", import.meta.url), "utf8"),
      readFileSync(new URL("./PrivateExperience.tsx", import.meta.url), "utf8"),
    ]
      .map(extractJsxText)
      .join(" ");
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
    expect(guide).toContain(
      "/contact?type=caribbean&amp;destination=Caribbean&amp;guide=caribbean"
    );
    expect(guide).toContain('aria-current="page"');
  });

  it("renders the branded school cruise and keeps the request advisor-led", () => {
    const schoolCruise = readFileSync(
      new URL("./SchoolCruise.tsx", import.meta.url),
      "utf8"
    );
    expect(schoolCruise).toContain("Grimsley High School");
    expect(schoolCruise).toContain(
      "Grimsley High School Graduation Cruise 2027"
    );
    expect(schoolCruise).toContain("Request your cabin");
    expect(schoolCruise).toContain("Forward");
    expect(schoolCruise).toContain(
      'href="https://www.carnival.com/cruise-ships/mardi-gras"'
    );
    expect(schoolCruise).toContain("scrollToProposalSection");
    expect(schoolCruise).not.toContain('href="#ship"');
    expect(schoolCruise).not.toContain('href="#estimate"');
    expect(schoolCruise).toContain("Explore the ship");
    expect(schoolCruise).toContain("Experience Mardi Gras");
    expect(schoolCruise).toContain("The Ultimate Playground");
    expect(schoolCruise).toContain("BOLT: Ultimate Sea Coaster");
    expect(schoolCruise).toContain("Explore Mardi Gras on Carnival");
    expect(schoolCruise).toContain('scrollToProposalSection("mardi-gras")');
    expect(schoolCruise).not.toContain("Something for every kind of");
    expect(schoolCruise).toContain("Sailing at a glance");
    expect(schoolCruise).toContain("Day by day");
    expect(schoolCruise).not.toContain("A ship worth getting to");
    expect(schoolCruise).toContain("mardiGrasHeroSlides");
    expect(schoolCruise).toContain("/manus-storage/waterworks_14b8fa60.jpg");
    expect(schoolCruise).toContain("/manus-storage/dining_aece338f.jpg");
    expect(schoolCruise).toContain("/manus-storage/entertainment_a310e8d3.jpg");
    expect(schoolCruise).toContain("/manus-storage/bolt_ca8c688b.jpg");
    expect(schoolCruise).toContain("Travel documents made");
    expect(schoolCruise).toContain("Frequently asked questions");
    expect(schoolCruise).toContain("Rate qualifiers");
    expect(schoolCruise).toContain("Vacation Protection");
    expect(schoolCruise).toContain(
      "Return to the top of the Grimsley proposal"
    );
    expect(schoolCruise).toContain("createPortal");
    expect(schoolCruise).toContain("document.body");
    const estimator = readFileSync(
      new URL("../components/GrimsleyCabinEstimator.tsx", import.meta.url),
      "utf8"
    );
    expect(schoolCruise).toContain("Inside cabins start at $708 per traveler");
    expect(schoolCruise).toContain("Balcony cabins start at $938 per traveler");
    expect(estimator).toContain("Inside cabins from $708 pp");
    expect(estimator).toContain("Balconies from $938 pp");
    expect(estimator).toContain("getGrimsleyCabinStartingFare(roomType)");
    expect(estimator).not.toContain('id="estimateCategory"');
    expect(estimator).not.toContain("cabinCategories");
    expect(schoolCruise).toContain(
      "does not hold a cabin or create a reservation"
    );
    expect(schoolCruise).not.toMatch(/[—–]/);
  });

  it("keeps semantic navigation and headings in the public experience", () => {
    const page = renderPage(<Home />);
    const guide = renderPage(<DestinationGuide />, "/destinations/caribbean");
    expect(page).toContain("<nav");
    expect(page).toContain('aria-label="Primary navigation"');
    expect(page).toContain("<main");
    expect(page).toContain("<h1");
    expect(page).toContain("/destinations/caribbean");
    expect(page).toContain("/destinations/mexico");
    expect(page).toContain("/destinations/cruises");
    expect(page).toContain("/destinations/all-inclusive");
    expect(page).toContain("/destinations/groups");
    expect(page).toContain("/contact?type=custom");
    const destinationsNavigation =
      guide.match(/<a[^>]*href="\/destinations"[^>]*>Destinations<\/a>/)?.[0] ??
      "";
    expect(destinationsNavigation).toContain("nav-link--active");
    expect(destinationsNavigation).toContain('aria-current="page"');
  });

  it("renders the privacy policy and publishes focused indexing artifacts", () => {
    const privacy = renderPage(<Privacy />, "/privacy");
    const robots = readFileSync(
      new URL("../../public/robots.txt", import.meta.url),
      "utf8"
    );
    const sitemap = readFileSync(
      new URL("../../public/sitemap.xml", import.meta.url),
      "utf8"
    );
    expect(privacy).toContain("Privacy policy");
    expect(privacy).toContain("Information you share");
    expect(privacy).toContain("We do not sell your personal information.");
    expect(robots).toContain("Disallow: /wendy");
    expect(robots).toContain("Sitemap:");
    expect(sitemap).toContain("/destinations/caribbean");
    expect(sitemap).toContain("/privacy");
    expect(sitemap).not.toContain(
      "/experiences/grimsley-hs-graduation-cruise-2027"
    );
  });
});
