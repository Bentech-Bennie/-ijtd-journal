"""
utils/payments.py
Payment gateway helpers: PayPal (foreign authors) + Mobile Money (Cameroon).

For PayPal, install: pip install paypalrestsdk
For production Mobile Money, integrate your operator's API (e.g. MTN MoMo API).
"""
import os
import hmac
import hashlib
import requests


# ── PayPal ─────────────────────────────────────────────────────────────────────

PAYPAL_CLIENT_ID     = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_BASE_URL      = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")  # sandbox by default


def _get_paypal_token():
    """Obtain a PayPal OAuth2 access token."""
    resp = requests.post(
        f"{PAYPAL_BASE_URL}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        data={"grant_type": "client_credentials"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def create_paypal_order(amount_usd: float, manuscript_number: str, return_url: str, cancel_url: str) -> dict:
    """
    Create a PayPal order and return the approval URL.
    Returns: {"order_id": str, "approve_url": str}
    """
    token = _get_paypal_token()
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {"currency_code": "USD", "value": str(round(amount_usd, 2))},
            "description": f"IJTD APC — {manuscript_number}",
            "custom_id": manuscript_number,
        }],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
            "brand_name": "IJTD",
            "user_action": "PAY_NOW",
        },
    }
    resp = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders",
        json=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    approve_url = next(
        (link["href"] for link in data.get("links", []) if link["rel"] == "approve"), ""
    )
    return {"order_id": data["id"], "approve_url": approve_url}


def capture_paypal_order(order_id: str) -> dict:
    """
    Capture a PayPal order after buyer approval.
    Returns the PayPal capture response dict.
    """
    token = _get_paypal_token()
    resp = requests.post(
        f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def verify_paypal_webhook(payload_bytes: bytes, headers: dict) -> bool:
    """
    Verify a PayPal webhook signature.
    In production set PAYPAL_WEBHOOK_ID env var and implement full verification.
    """
    webhook_id = os.getenv("PAYPAL_WEBHOOK_ID", "")
    if not webhook_id:
        return True  # skip verification in dev
    # Full verification requires calling PayPal's verify-webhook-signature endpoint
    return True


# ── Mobile Money (Cameroon — MTN MoMo stub) ───────────────────────────────────

MTN_MOMO_BASE_URL      = os.getenv("MTN_MOMO_BASE_URL", "https://sandbox.momodeveloper.mtn.com")
MTN_MOMO_SUBSCRIPTION  = os.getenv("MTN_MOMO_SUBSCRIPTION_KEY", "")
MTN_MOMO_API_USER      = os.getenv("MTN_MOMO_API_USER", "")
MTN_MOMO_API_KEY       = os.getenv("MTN_MOMO_API_KEY", "")


def request_mobile_money_payment(
    phone_number: str,
    amount_xaf: float,
    manuscript_number: str,
    payer_message: str = "IJTD Publication Fee",
) -> dict:
    """
    Initiate an MTN Mobile Money collection request.
    Returns: {"reference_id": str, "status": "pending"} or raises on error.
    This is a sandbox stub — replace with live credentials for production.
    """
    import uuid
    reference_id = str(uuid.uuid4())

    headers = {
        "X-Reference-Id": reference_id,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": MTN_MOMO_SUBSCRIPTION,
        "Authorization": f"Basic {_mtn_basic_auth()}",
        "Content-Type": "application/json",
    }
    payload = {
        "amount": str(int(amount_xaf)),
        "currency": "XAF",
        "externalId": manuscript_number,
        "payer": {"partyIdType": "MSISDN", "partyId": phone_number},
        "payerMessage": payer_message,
        "payeeNote": f"IJTD APC {manuscript_number}",
    }
    resp = requests.post(
        f"{MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay",
        json=payload, headers=headers, timeout=15,
    )

    if resp.status_code == 202:
        return {"reference_id": reference_id, "status": "pending"}
    else:
        return {"reference_id": reference_id, "status": "failed", "detail": resp.text}


def check_mobile_money_status(reference_id: str) -> dict:
    """Check the status of a Mobile Money payment request."""
    headers = {
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": MTN_MOMO_SUBSCRIPTION,
        "Authorization": f"Basic {_mtn_basic_auth()}",
    }
    resp = requests.get(
        f"{MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/{reference_id}",
        headers=headers, timeout=10,
    )
    if resp.ok:
        data = resp.json()
        return {
            "reference_id": reference_id,
            "status": data.get("status", "UNKNOWN").lower(),
            "financial_transaction_id": data.get("financialTransactionId"),
        }
    return {"reference_id": reference_id, "status": "error"}


def _mtn_basic_auth() -> str:
    import base64
    return base64.b64encode(f"{MTN_MOMO_API_USER}:{MTN_MOMO_API_KEY}".encode()).decode()