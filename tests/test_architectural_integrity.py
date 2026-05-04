import pytest
import json
import os
import re
from playwright.sync_api import Page, expect

def test_external_links_security(page: Page, base_url):
    """Architectural Test: All target='_blank' links must have rel='noopener noreferrer'."""
    page.goto(base_url)
    
    # Get all links with target="_blank"
    external_links = page.locator('a[target="_blank"]')
    count = external_links.count()
    
    for i in range(count):
        rel = external_links.nth(i).get_attribute("rel")
        assert rel == "noopener noreferrer", f"Link {i} is missing secure rel attribute"

def test_data_schema_categories(base_url):
    """Architectural Test: Ensure site-data.json categories follow the plural image_urls schema."""
    data_path = os.path.join(os.getcwd(), "configs/site-data.json")
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    categories = data.get('categories', [])
    assert len(categories) > 0
    
    for cat in categories:
        # We moved to image_urls
        assert 'image_urls' in cat, f"Category {cat.get('name')} missing 'image_urls'"
        # Check if it's a pipe-separated string
        assert isinstance(cat['image_urls'], str)

def test_mobile_footer_ordering(page: Page, base_url):
    """UX Test: Verify phone number is second row on mobile via Flexbox ordering."""
    page.set_viewport_size({"width": 375, "height": 667})
    page.goto(base_url)
    
    # Phone link should have a higher Y coordinate than the social links
    phone = page.locator(".phone-link")
    social = page.locator(".social-link").first
    
    expect(phone).to_be_visible()
    expect(social).to_be_visible()
    
    phone_box = phone.bounding_box()
    social_box = social.bounding_box()
    
    assert phone_box['y'] > social_box['y'] + 10, "Phone link should be below social links on mobile"

def test_rotation_engine_fallback(page: Page, base_url):
    """Robustness Test: Verify card rendering with single image fallback."""
    # We use a custom route to inject a category with single image
    def handle_route(route):
        response = route.fetch()
        data = response.json()
        data['categories'] = [{
            "name": "Fallback Tier",
            "showOnHomePage": "TRUE",
            "image_url": "legacy_image.jpg", # Single image
            "image_urls": "", # Empty urls
            "description": "Test",
            "inclusions": "Test"
        }]
        route.fulfill(json=data)
    
    page.route("**/site-data.json*", handle_route)
    page.goto(base_url + "/#services")
    
    # Card should still render one layer
    # Use a more explicit wait for the grid first
    page.wait_for_selector("#packages-grid-container")
    layers = page.locator(".package-card-layer")
    expect(layers).to_have_count(1, timeout=10000)
    expect(layers).to_have_class(re.compile(r"active"))
