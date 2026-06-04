# Apple Retention Messaging Endpoint

This function implements Apple's `Get Retention Message` endpoint for real-time retention messaging.

Endpoint after deploy:

```text
https://<supabase-project-ref>.functions.supabase.co/apple-retention-message
```

Use that full URL in App Store Connect or with Apple's Configure Realtime URL API.

## Required Setup

Apple does not let this endpoint return arbitrary message text. It must return the `messageIdentifier` of a retention message that was uploaded through the Retention Messaging API and approved by Apple.

Set these Supabase secrets before deployment:

```sh
supabase secrets set APPLE_BUNDLE_ID="com.your.bundle"
supabase secrets set APPLE_APP_APPLE_ID="1234567890"
supabase secrets set APPLE_RETENTION_MESSAGE_IDENTIFIER="<approved-message-uuid>"
supabase secrets set APPLE_ROOT_CERTIFICATES_BASE64='["<base64-der-apple-root-ca>","<base64-der-apple-root-ca>"]'
```

Optional secrets:

```sh
supabase secrets set APPLE_RETENTION_ENVIRONMENTS="Sandbox,Production"
supabase secrets set APPLE_RETENTION_ALLOWED_PRODUCT_IDS="fortis_pro_monthly,fortis_pro_annual"
supabase secrets set APPLE_RETENTION_MESSAGE_IDS_BY_PRODUCT='{"fortis_pro_monthly":"<message-uuid>","fortis_pro_annual":"<message-uuid>"}'
supabase secrets set APPLE_RETENTION_ENABLE_ONLINE_CHECKS="false"
```

`APPLE_ROOT_CERTIFICATES_BASE64` should contain DER-encoded Apple root certificates from Apple PKI. The official App Store Server Library expects root certificates as bytes and verifies Apple's JWS certificate chain from the incoming `signedPayload`.

## Deploy

Deploy without Supabase JWT verification because Apple will not send a Supabase auth token:

```sh
supabase functions deploy apple-retention-message --no-verify-jwt
```

## App Store Connect Flow

1. Upload at least one retention message with Apple's Retention Messaging API.
2. Wait for the message to reach `APPROVED` state. Sandbox approves automatically.
3. Configure default messages for the relevant product IDs/locales.
4. Deploy this endpoint and add its URL to App Store Connect.
5. Run Apple's sandbox performance test.
6. After passing, configure the production URL.

The function does no database work on the request path so it can stay within Apple's production timeout.
