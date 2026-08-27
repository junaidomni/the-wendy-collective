import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import About from "./About";
import DestinationGuide from "./DestinationGuide";
import Destinations from "./Destinations";
import Faq from "./Faq";
import Home from "./Home";

function renderPage(page: React.ReactElement, path = "/") {
  return renderToStaticMarkup(<Router hook={() => [path, () => undefined]}>{page}</Router>);
}

describe("public site content", () => {
  it("renders the homepage promise, Why Choose Wendy content, and consultation path", () => {
    const page = renderPage(<Home />);
    expect(page).toContain("Let’s plan a journey");
    expect(page).toContain("Why choose Wendy");
    expect(page).toContain("Plan Your Journey");
    expect(page).toContain("/contact");
  });

  it("renders the approved public information architecture", () => {
    const about = renderPage(<About />);
    const destinations = renderPage(<Destinations />);
    const faq = renderPage(<Faq />);
    const guide = renderPage(<DestinationGuide />, "/destinations/caribbean");
    expect(about).toContain("A travel advisor with a");
    expect(destinations).toContain("Explore the collections");
    expect(destinations).toContain("All-Inclusive Escapes");
    expect(faq).toContain("How does the planning process begin?");
    expect(faq).toContain("How much do your planning services cost?");
    expect(guide).toContain("Caribbean, at your");
    expect(guide).toContain("Plan a Caribbean escape");
    expect(guide).toContain("/contact?type=caribbean&amp;destination=Caribbean&amp;guide=caribbean");
    expect(guide).toContain("aria-current=\"page\"");
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
});
