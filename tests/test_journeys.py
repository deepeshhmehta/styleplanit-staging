import pytest
import json
from playwright.sync_api import Page, expect

def mock_journey_data(page: Page, categories):
    """Intercept site-data.json and inject custom categories."""
    def handle_route(route):
        response = route.fetch()
        data = response.json()
        data['categories'] = categories
        route.fulfill(json=data)
    
    page.route("**/site-data.json", handle_route)

def test_journey_desktop_expansion_and_centering(page: Page, base_url):
    """System Test: Verify horizontal expansion and JS centering on desktop."""
    mock_journey_data(page, [
        {"name": "Establish", "showOnHomePage": "TRUE", "image_url": ""},
        {"name": "Reclaim", "showOnHomePage": "TRUE", "image_url": ""},
        {"name": "Elevate", "showOnHomePage": "TRUE", "image_url": ""}
    ])
    
    page.goto(base_url + "/#services")
    
    # 1. Expand the 2nd card
    cards = page.locator(".package-card")
    expect(cards).to_have_count(3)
    
    middle_card = cards.nth(1)
    middle_card.click()
    
    # 2. Verify expansion state
    grid = page.locator("#packages-grid-container")
    expect(grid).to_have_attribute("data-state", "active")
    
    # 3. Verify horizontal centering (scrollLeft should be > 0 if middle card is centered)
    wrapper = page.locator("#packages-grid-wrapper")
    # Wait for animation
    page.wait_for_timeout(1000)
    
    scroll_left = wrapper.evaluate("node => node.scrollLeft")
    assert scroll_left > 0

def test_journey_mobile_responsive_width(browser, base_url):
    """System Test: Verify modal uses correct VW-based width on mobile."""
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True)
    page = context.new_page()
    
    mock_journey_data(page, [
        {"name": "Mobile Tier", "showOnHomePage": "TRUE", "image_url": ""}
    ])
    
    page.goto(base_url + "/#services")
    
    card = page.locator(".package-card").first
    card.click()
    
    # Wait for expansion
    page.wait_for_timeout(500)
    
    box = card.bounding_box()
    # On mobile, expanded card should be approx 82vw
    # 82vw of 390 is 319.8. We check for a range.
    assert box['width'] < 390
    assert box['width'] > 300
    
    context.close()
