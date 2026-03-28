"""Playwright automation engine for directory submissions."""
import asyncio
import logging
import random
from pathlib import Path
from typing import Optional, Dict, List, Tuple, Any
from playwright.async_api import async_playwright, Page, Browser, BrowserContext, Playwright
from app.config import get_settings

try:
    import pytesseract as _pytesseract  # pyright: ignore[reportMissingImports]
except Exception:  # pragma: no cover - optional dependency safety
    _pytesseract: Any = None

try:
    from PIL import Image as _PILImage  # pyright: ignore[reportMissingImports]
except Exception:  # pragma: no cover - optional dependency safety
    _PILImage: Any = None

logger = logging.getLogger(__name__)
settings = get_settings()
SubmissionResult = Tuple[bool, Optional[str], Optional[str], Optional[str], Optional[float]]


class FormFieldDetector:
    """Detect form fields and their types using multiple strategies."""
    
    FIELD_NAME_KEYWORDS = {
        "company_name": ["company", "business", "name"],
        "business_name": ["business", "name"],
        "url": ["website", "url", "site", "domain"],
        "website": ["website", "web"],
        "email": ["email", "mail"],
        "phone": ["phone", "tel", "telephone", "mobile"],
        "description": ["description", "about", "bio", "details"],
        "address": ["address", "street"],
        "city": ["city", "town"],
        "state": ["state", "province"],
        "country": ["country", "nation"],
        "zip": ["zip", "postal", "code"],
        "category": ["category", "industry", "type"],
        "submit": ["submit", "send", "apply", "register"]
    }
    
    @staticmethod
    async def detect_input_fields(page: Page) -> Dict[str, List[Dict[str, str]]]:
        """Detect all input fields on the page."""
        fields: Dict[str, List[Dict[str, str]]] = {}
        
        # Find all input elements
        inputs = await page.query_selector_all("input[type='text'], input[type='email'], input[type='tel'], input[type='url'], input, textarea")
        
        for input_elem in inputs:
            field_info: Dict[str, str] = {
                "type": await input_elem.get_attribute("type") or "text",
                "name": await input_elem.get_attribute("name") or "",
                "id": await input_elem.get_attribute("id") or "",
                "placeholder": await input_elem.get_attribute("placeholder") or "",
                "value": await input_elem.get_attribute("value") or ""
            }
            
            # Get associated label
            input_id = field_info["id"]
            if input_id:
                label = await page.query_selector(f"label[for='{input_id}']")
                if label:
                    label_text = await label.text_content()
                    if label_text:
                        field_info["label"] = label_text
            
            # Match field to data type
            matched_type = FormFieldDetector.match_field_type(field_info)
            if matched_type not in fields:
                fields[matched_type] = []
            
            fields[matched_type].append(field_info)
        
        return fields
    
    @staticmethod
    def match_field_type(field_info: Dict[str, str]) -> str:
        """Match a field to a data type using heuristics."""
        combined_text = (
            field_info.get("name", "").lower() + " " +
            field_info.get("id", "").lower() + " " +
            field_info.get("placeholder", "").lower() + " " +
            field_info.get("label", "").lower()
        ).strip()
        
        for field_type, keywords in FormFieldDetector.FIELD_NAME_KEYWORDS.items():
            for keyword in keywords:
                if keyword in combined_text:
                    return field_type
        
        # Default based on input type
        input_type = field_info.get("type", "").lower()
        if "email" in input_type:
            return "email"
        elif "tel" in input_type or "phone" in input_type:
            return "phone"
        elif "url" in input_type or "website" in input_type:
            return "url"
        
        return "unknown"
    
    @staticmethod
    async def find_submit_button(page: Page) -> Optional[Dict[str, str]]:
        """Find submit button on the page."""
        # Try to find various submit button types
        selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:has-text('Submit')",
            "button:has-text('send')",
            "button:has-text('Register')",
            "button:has-text('Apply')",
            "a:has-text('Submit')"
        ]
        
        for selector in selectors:
            button = await page.query_selector(selector)
            if button and await button.is_visible():
                button_text = await button.text_content()
                return {
                    "selector": selector,
                    "text": button_text or ""
                }
        
        return None


class CaptchaDetector:
    """Detect various types of captcha."""

    CAPTCHA_IMAGE_SELECTOR = "img[alt*='captcha' i], img[src*='captcha' i], img[id*='captcha' i], img[class*='captcha' i]"
    
    @staticmethod
    async def detect_captcha(page: Page) -> Optional[str]:
        """Detect if page has captcha."""
        # Check for reCAPTCHA
        recaptcha = await page.query_selector("[data-sitekey]")
        if recaptcha:
            return "recaptcha"
        
        if await page.locator("iframe[src*='recaptcha']").count() > 0:
            return "recaptcha"
        
        # Check for hCaptcha
        hcaptcha = await page.query_selector("[data-sitekey*='h_']")
        if hcaptcha:
            return "hcaptcha"
        
        if await page.locator("iframe[src*='hcaptcha']").count() > 0:
            return "hcaptcha"

        if await page.locator("iframe[src*='challenges.cloudflare.com']").count() > 0:
            return "turnstile"

        if await page.locator(".cf-challenge, #challenge-form").count() > 0:
            return "cloudflare"
        
        # Check for math captcha
        captcha_text = await page.locator("body").text_content()
        if captcha_text and any(math_phrase in captcha_text.lower() for math_phrase in ["calculate", "math", "add", "plus", "minus"]):
            return "math"

        if captcha_text and any(
            phrase in captcha_text.lower()
            for phrase in ["verify you are human", "human verification", "security challenge", "are you a robot"]
        ):
            return "challenge"

        if await page.locator(CaptchaDetector.CAPTCHA_IMAGE_SELECTOR).count() > 0:
            return "image"
        
        return None


class CaptchaSolver:
    """Basic OCR-driven captcha helper."""

    @staticmethod
    async def solve_image_captcha(page: Page) -> Tuple[Optional[str], float, Optional[str]]:
        image = await page.query_selector(CaptchaDetector.CAPTCHA_IMAGE_SELECTOR)
        if not image:
            return None, 0.0, None

        screenshot_dir = Path("captcha_screenshots")
        screenshot_dir.mkdir(exist_ok=True)
        screenshot_path = screenshot_dir / f"captcha-{random.randint(100000, 999999)}.png"
        await image.screenshot(path=str(screenshot_path))

        if _pytesseract is None or _PILImage is None:
            return None, 0.0, str(screenshot_path)

        try:
            pytesseract_module: Any = _pytesseract
            image_module: Any = _PILImage
            with image_module.open(screenshot_path) as captcha_img:
                ocr_text = pytesseract_module.image_to_string(captcha_img, config="--psm 7").strip()
            cleaned = "".join(ch for ch in ocr_text if ch.isalnum())
            confidence = min(max(len(cleaned) / 6, 0.0), 1.0)
            return cleaned or None, confidence, str(screenshot_path)
        except Exception as exc:
            logger.warning("Captcha OCR failed: %s", exc)
            return None, 0.0, str(screenshot_path)


class PlaywrightAutomationEngine:
    """Playwright automation engine for directory submissions."""
    
    def __init__(self):
        """Initialize automation engine."""
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.playwright: Optional[Playwright] = None
    
    async def initialize(self) -> None:
        """Initialize Playwright and browser."""
        self.playwright = await async_playwright().start()
        
        # Launch browser with proxy if configured
        launch_args: Dict[str, Any] = {
            "headless": settings.PLAYWRIGHT_HEADLESS,
        }
        
        # TEMP: Disable TOR proxy (not configured)
        use_tor = False

        if use_tor:
            launch_args["proxy"] = {
                "server": "socks5://127.0.0.1:9050"
            }
        
        self.browser = await self.playwright.chromium.launch(**launch_args)
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
    
    async def cleanup(self) -> None:
        """Cleanup browser and playwright."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def submit_to_directory(
        self,
        directory_url: str,
        business_data: Dict[str, Any]
    ) -> SubmissionResult:
        """
        Attempt to submit business listing to directory.
        
        Returns:
            (success: bool, error_message: Optional[str], captcha_type: Optional[str])
        """
        if self.context is None:
            raise RuntimeError("Automation engine not initialized. Call initialize() first.")

        max_attempts = max(1, min(settings.MAX_SUBMISSION_RETRIES, 3))
        last_error: Optional[str] = None

        for attempt in range(1, max_attempts + 1):
            page: Optional[Page] = None
            try:
                page = await self.context.new_page()
                page.set_default_timeout(settings.PLAYWRIGHT_TIMEOUT_MS)

                logger.info("Navigating to %s (attempt %s/%s)", directory_url, attempt, max_attempts)
                await page.goto(directory_url, wait_until="domcontentloaded")
                await self._human_pause()

                captcha_type = await CaptchaDetector.detect_captcha(page)
                if captcha_type:
                    if captcha_type == "image":
                        solved_text, confidence, screenshot_path = await CaptchaSolver.solve_image_captcha(page)
                        if solved_text and confidence >= 0.72:
                            await self._fill_captcha_field(page, solved_text)
                        else:
                            logger.warning("Image captcha low confidence: %.2f", confidence)
                            if attempt < max_attempts:
                                await asyncio.sleep(random.uniform(0.8, 2.0))
                                continue
                            return False, "Captcha requires manual review", captcha_type, screenshot_path, confidence
                    elif captcha_type == "math":
                        if attempt < max_attempts:
                            await asyncio.sleep(random.uniform(0.8, 2.0))
                            continue
                        return False, "Math captcha requires manual review", captcha_type, None, None
                    else:
                        logger.warning("Complex captcha detected: %s", captcha_type)
                        return False, "Complex captcha detected", captcha_type, None, None

                fields = await FormFieldDetector.detect_input_fields(page)
                logger.info("Detected fields: %s", list(fields.keys()))
                await self._fill_form_fields(page, fields, business_data)
                await self._human_pause()

                submit_btn = await FormFieldDetector.find_submit_button(page)
                if not submit_btn:
                    last_error = "Could not find submit button"
                    if attempt < max_attempts:
                        await asyncio.sleep(random.uniform(0.8, 2.0))
                        continue
                    return False, last_error, None, None, None

                logger.info("Clicking submit button: %s", submit_btn["text"])
                await page.click(submit_btn["selector"])
                try:
                    await page.wait_for_load_state("networkidle", timeout=5000)
                except Exception:
                    pass

                success_indicators = [
                    "success", "submitted", "confirmed", "completed", "thank you",
                    "registration complete", "listing added", "confirmed"
                ]
                page_text = await page.locator("body").text_content()
                if page_text and any(indicator in page_text.lower() for indicator in success_indicators):
                    logger.info("Submission successful")
                    return True, None, captcha_type, None, None

                return True, None, captcha_type, None, None
            except Exception as e:
                last_error = str(e)
                logger.warning("Submission attempt %s failed: %s", attempt, last_error)
                if attempt < max_attempts:
                    await asyncio.sleep(random.uniform(0.8, 2.0))
                    continue
            finally:
                if page:
                    await page.close()

        return False, last_error or "Submission failed", None, None, None

    async def verify_url(self, url: str) -> tuple[bool, Optional[str]]:
        """Open a verification URL and infer whether the verification succeeded."""
        page: Optional[Page] = None
        try:
            if self.context is None:
                raise RuntimeError("Automation engine not initialized. Call initialize() first.")

            page = await self.context.new_page()
            page.set_default_timeout(settings.PLAYWRIGHT_TIMEOUT_MS)
            response = await page.goto(url, wait_until="domcontentloaded")
            await self._human_pause()

            # Some verification pages require one final click.
            click_selectors = [
                "button:has-text('Verify')",
                "button:has-text('Confirm')",
                "a:has-text('Verify')",
                "a:has-text('Confirm')",
                "input[type='submit'][value*='Verify' i]",
                "input[type='submit'][value*='Confirm' i]",
            ]
            for selector in click_selectors:
                try:
                    locator = page.locator(selector).first
                    if await locator.count() > 0 and await locator.is_visible():
                        await locator.click()
                        await page.wait_for_load_state("networkidle", timeout=7000)
                        break
                except Exception:
                    continue

            body_text = (await page.locator("body").text_content() or "").lower()
            success_phrases = (
                "verified",
                "verification complete",
                "email confirmed",
                "account confirmed",
                "successfully verified",
                "thank you",
            )
            failure_phrases = (
                "expired",
                "invalid",
                "already used",
                "verification failed",
                "not found",
            )

            if any(phrase in body_text for phrase in success_phrases):
                return True, None
            if any(phrase in body_text for phrase in failure_phrases):
                return False, "Verification link is invalid or expired"
            if response and response.status >= 400:
                return False, f"Verification URL returned HTTP {response.status}"
            return True, None
        except Exception as exc:
            return False, str(exc)
        finally:
            if page:
                await page.close()
    
    async def _fill_form_fields(self, page: Page, fields: Dict[str, List[Dict[str, str]]], business_data: Dict[str, Any]) -> None:
        """Fill form fields with business data."""
        # Mapping of detected field types to business data
        field_mapping = {
            "company_name": business_data.get("business_name"),
            "business_name": business_data.get("business_name"),
            "url": business_data.get("website"),
            "website": business_data.get("website"),
            "email": business_data.get("email"),
            "phone": business_data.get("phone"),
            "description": business_data.get("description"),
            "category": business_data.get("category"),
            "country": business_data.get("country"),
            "city": business_data.get("city"),
            "state": business_data.get("state")
        }
        
        for field_type, field_list in fields.items():
            if field_type == "unknown" or field_type == "submit":
                continue
            
            value = field_mapping.get(field_type)
            if not value:
                continue
            
            # Fill first matching field of this type
            for field in field_list:
                try:
                    # Select by various attributes
                    selector = None
                    if field.get("id"):
                        selector = f"#{field['id']}"
                    elif field.get("name"):
                        selector = f"input[name='{field['name']}'], textarea[name='{field['name']}']"
                    
                    if selector:
                        logger.info(f"Filling {field_type} with selector {selector}")
                        await page.click(selector, timeout=5000)
                        await page.type(selector, str(value), delay=random.randint(35, 90))
                        break
                except Exception as e:
                    logger.warning(f"Could not fill field {field_type}: {e}")
                    continue

    async def _fill_captcha_field(self, page: Page, value: str) -> None:
        selectors = [
            "input[name*='captcha' i]",
            "input[id*='captcha' i]",
            "input[placeholder*='captcha' i]",
        ]
        for selector in selectors:
            locator = await page.query_selector(selector)
            if locator:
                await page.fill(selector, value)
                return

    async def _human_pause(self) -> None:
        await asyncio.sleep(random.uniform(0.4, 1.1))


# Global automation engine instance
_automation_engine: Optional[PlaywrightAutomationEngine] = None


async def get_automation_engine() -> PlaywrightAutomationEngine:
    """Get or create automation engine instance."""
    global _automation_engine
    if _automation_engine is None:
        _automation_engine = PlaywrightAutomationEngine()
        await _automation_engine.initialize()
    return _automation_engine
