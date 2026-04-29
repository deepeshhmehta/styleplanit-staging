import pytest
import re
from playwright.sync_api import Page, expect

def test_homepage_hydration(page: Page, base_url):
    """Verify that the page loads and loader fades out."""
    page.goto(base_url)
    
    # Loader should eventually disappear or be hidden
    loader = page.locator("#loader-overlay")
    try:
        expect(loader).to_have_class("fade-out", timeout=5000)
    except:
        expect(loader).not_to_be_visible()
    
    # Site wrapper should be visible
    wrapper = page.locator(".site-wrapper")
    expect(wrapper).to_be_visible()

def test_package_expansion(page: Page, base_url):
    """Verify that clicking a package card expands it horizontally."""
    page.goto(base_url + "/#services")
    
    # Wait for grid to hydrate
    page.wait_for_selector(".package-card")
    
    # Find a package card
    package = page.locator(".package-card").first
    package.click()
    
    # Grid should become active (System class check)
    grid = page.locator("#packages-grid-container")
    expect(grid).to_have_attribute("data-state", "active", timeout=5000)
    
    # Check for details container visibility
    details = package.locator(".package-details-expanded")
    expect(details).to_be_visible()

def test_services_sorting_and_seen_state(page: Page, base_url):
    """Verify services grid sorting and seen state logic."""
    page.goto(base_url + "/services")
    
    # 1. Verify Price Visibility (System feature)
    price = page.locator(".service-card .service-price").first
    expect(price).to_be_visible()
    
    # 2. Test Sorting System
    sort_trigger = page.locator(".sort-label")
    expect(sort_trigger).to_be_visible()
    sort_trigger.click()
    
    # Select any non-default option
    option = page.locator(".sort-menu li").nth(1)
    option.click()
    
    # Verify grid stability
    expect(page.locator(".services-grid")).to_be_visible()
    
    # 3. Test 'Seen' State Logic
    first_card = page.locator(".service-card").first
    first_card.click()
    
    # Details should show
    details = page.locator("#service-details-container")
    expect(details).to_be_visible()
    
    # Close details
    close_btn = details.locator(".btn-close-details")
    close_btn.click()
    
    # Grid should be back, and card should have 'seen' class (Pattern check)
    expect(first_card).to_have_class(re.compile(r"seen"), timeout=5000)
