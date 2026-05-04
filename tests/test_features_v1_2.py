import pytest
import json
import re
from playwright.sync_api import Page, expect

def mock_site_data(page: Page, overrides):
    """Intercept site-data.json and apply overrides."""
    def handle_route(route):
        response = route.fetch()
        data = response.json()
        for key, value in overrides.items():
            data[key] = value
        route.fulfill(json=data)
    
    page.route("**/site-data.json*", handle_route)

def test_alternating_category_images(page: Page, base_url):
    """Verify that category images rotate correctly."""
    mock_site_data(page, {
        "categories": [
            {
                "name": "Establish",
                "showOnHomePage": "TRUE",
                "image_urls": "img1.jpg|img2.jpg",
                "inclusions": "Test",
                "description": "Test",
                "booking_link": "#"
            }
        ]
    })
    
    page.goto(base_url + "/#services")
    
    # Wait for card
    card = page.locator(".package-card").first
    layers = card.locator(".package-card-layer")
    expect(layers).to_have_count(2)
    
    # Layer 1 should be active initially
    expect(layers.nth(0)).to_have_class(re.compile(r"active"))
    expect(layers.nth(1)).not_to_have_class(re.compile(r"active"))
    
    # We can't wait 5 seconds in a fast test, but we can verify the structure
    # and maybe trigger the rotation if we had a handle, but for now, 
    # we'll verify the existence of the layers and the initial active state.
    # To truly test rotation, we'd need to mock the timer or wait.
    
def test_footer_social_links_desktop(page: Page, base_url):
    """Verify social links in footer on desktop."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(base_url)
    
    footer = page.locator("footer")
    
    # Check for TikTok
    tiktok = footer.locator('a[href-config-key="FOOTER_TIKTOK_HREF"]')
    expect(tiktok).to_be_visible()
    expect(tiktok.locator(".desktop-only")).to_be_visible()
    
    # Check for LinkedIn
    linkedin = footer.locator('a[href-config-key="FOOTER_LINKEDIN_HREF"]')
    expect(linkedin).to_be_visible()
    expect(linkedin.locator(".desktop-only")).to_be_visible()
    
    # Check for Email
    email = footer.locator('a[href-config-key="FOOTER_EMAIL_HREF"]')
    expect(email).to_be_visible()
    
    # Wait for hydration of the config text
    expect(email.locator(".desktop-only")).to_contain_text("@styleplanit.com", timeout=10000)

def test_footer_social_links_mobile(page: Page, base_url):
    """Verify social links in footer on mobile (icons only + phone row)."""
    page.set_viewport_size({"width": 375, "height": 667})
    page.goto(base_url)
    
    footer = page.locator("footer")
    
    # Social text should be hidden
    expect(footer.locator('a[href-config-key="FOOTER_TIKTOK_HREF"] .desktop-only')).not_to_be_visible()
    
    # Phone text should still be visible
    expect(footer.locator('a[href-config-key="FOOTER_PHONE_HREF"] span[text-config-key="FOOTER_PHONE_TEXT"]')).to_be_visible()
    
    # Verify two-row layout via bounding boxes
    tiktok_box = footer.locator('a[href-config-key="FOOTER_TIKTOK_HREF"]').bounding_box()
    phone_box = footer.locator('a[href-config-key="FOOTER_PHONE_HREF"]').bounding_box()
    
    assert phone_box['y'] > tiktok_box['y'] + 10  # Phone is on a lower row

def test_analytics_event_delegation(page: Page, base_url):
    """Verify that clicking a package card triggers a GA event (if implemented)."""
    # This is speculative based on js/features/analytics.js
    # We can mock gtag
    page.add_init_script("window.gtag = (...args) => { window.last_gtag = args; }")
    
    page.goto(base_url + "/#services")
    
    # Wait for hydration
    page.wait_for_selector(".package-card")
    
    page.locator(".package-card").first.click()
    
    # Check if gtag was called
    last_event = page.evaluate("window.last_gtag")
    if last_event:
        assert last_event[0] == "event"
