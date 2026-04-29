import pytest

def pytest_addoption(parser):
    parser.addoption("--env", action="store", default="local", help="Environment to test: local, develop, staging, prod")

@pytest.fixture(scope="session")
def base_url(request):
    env = request.config.getoption("--env")
    mapping = {
        "local": "http://localhost:8000",
        "develop": "https://develop.styleplanit.com",
        "staging": "https://staging.styleplanit.com",
        "prod": "https://styleplanit.com"
    }
    return mapping.get(env, "http://localhost:8000")

@pytest.fixture
def page_context(browser):
    # Desktop Baseline
    context = browser.new_context(
        viewport={'width': 1920, 'height': 1080},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) QA-Engine"
    )
    return context

@pytest.fixture
def mobile_context(browser):
    # iPhone 13 Pro Baseline
    context = browser.new_context(
        viewport={'width': 390, 'height': 844},
        is_mobile=True,
        has_touch=True,
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
    )
    return context
