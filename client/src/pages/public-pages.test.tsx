import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import About from "./About";
import Destinations from "./Destinations";
import Faq from "./Faq";
import Home from "./Home";

function renderPage(page: React.ReactElement) {
  return renderToStaticMarkup(<Router hook={() => ["/", () => undefined]}>{page}</Router>);
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
    expect(about).toContain("A travel advisor with a");
    expect(destinations).toContain("Caribbean, at your own pace.");
    expect(destinations).toContain("All-Inclusive, Elevated");
    expect(faq).toContain("How does the planning process begin?");
    expect(faq).toContain("How much do your planning services cost?");
  });

  it("keeps semantic navigation and headings in the public experience", () => {
    const page = renderPage(<Home />);
    expect(page).toContain("<nav");
    expect(page).toContain("aria-label=\"Primary navigation\"");
    expect(page).toContain("<main");
    expect(page).toContain("<h1");
  });
});
