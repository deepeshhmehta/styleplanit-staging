import pytest
import json
import re
from playwright.sync_api import Page, expect

def mock_promo_data(page: Page, promos):
    """Intercept site-data.json and inject custom promos."""
    # Use a more aggressive routing that forces fulfillment immediately
    page.route("**/configs/site-data.json*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "articles": [],
            "categories": [],
            "dialogs": promos,
            "personas": [],
            "reviews": [],
            "services": [],
            "team": [],
            "assets_manifest": {}
        })
    ))

def test_standard_modal_trigger(page: Page, base_url):
    """System Test: Verify a standard modal appears after configured delay."""
    mock_promo_data(page, [{
        "id": "test-modal",
        "type": "modal",
        "title": "System Test Modal",
        "description": "Verification of trigger logic",
        "timeInSeconds": "1",
        "action": "https://cal.com/test",
        "cta": "Test Button"
    }])
    
    # Go to a neutral path to avoid any redirection issues
    page.goto(base_url + "/?test=true")
    
    # Verify backdrop and modal appear (Check for .visible class which triggers entrance)
    expect(page.locator(".promo-backdrop")).to_have_class(re.compile(r"visible"), timeout=10000)
    modal = page.locator(".promo-card.modal")
    expect(modal).to_have_class(re.compile(r"visible"))
    
    # Check title with more context to avoid matching real data
    expect(modal.locator(".promo-title")).to_contain_text("System Test Modal")
    
    # Verify dismissal
    modal.locator(".promo-close").click()
    expect(modal).not_to_have_class(re.compile(r"visible"))

def test_promo_expiry_logic(page: Page, base_url):
    """System Test: Verify that expired promos are NOT rendered."""
    mock_promo_data(page, [{
        "id": "expired-promo",
        "type": "modal",
        "title": "Should Not Appear",
        "expiryDate": "2020-01-01",
        "timeInSeconds": "1"
    }])
    
    page.goto(base_url + "/?test=expiry")
    
    # Wait longer than trigger time
    page.wait_for_timeout(3000)
    
    # Modal should NOT be in DOM/visible
    expect(page.locator(".promo-card.modal")).not_to_be_visible()

def test_persistent_trigger_conversion(page: Page, base_url):
    """System Test: Verify modal converts to floating trigger icon if 'persist' is enabled."""
    mock_promo_data(page, [{
        "id": "persistent-promo",
        "type": "modal",
        "title": "Persistent Offer",
        "persist": "TRUE",
        "timeInSeconds": "1"
    }])
    
    page.goto(base_url + "/?test=persist")
    
    # Close modal
    modal = page.locator(".promo-card.modal")
    expect(modal).to_have_class(re.compile(r"visible"), timeout=10000)
    modal.locator(".promo-close").click()
    
    # Verify persistent icon appears in CTA stack (using specific class)
    trigger = page.locator("#promo-trigger-floating")
    expect(trigger).to_have_class(re.compile(r"visible"), timeout=5000)
    
    # Verify re-opening
    trigger.click()
    expect(modal).to_have_class(re.compile(r"visible"))
