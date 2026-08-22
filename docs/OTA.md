# OTA updates (EAS Update)

Get Along ships JS updates over EAS Update. Native changes still need a new
binary.

## Channels

Mapped in `eas.json` to EAS build profiles:

| Channel | Build profile | When |
| --- | --- | --- |
| `development` | `development` | Dev client |
| `preview` | `preview` | Internal APK / TestFlight-style |
| `production` | `production` | Store builds |

Project id (from `app.config.js` / `eas.json`): `def8ecfb-0854-4666-87b8-060505d2ef7e`

Update URL: `https://u.expo.dev/def8ecfb-0854-4666-87b8-060505d2ef7e`

`runtimeVersion` uses the `appVersion` policy (`1.0.0` today). An update only
applies to binaries with the same runtime. Bump `version` in `app.config.js`
when you ship a native rebuild so old binaries do not receive incompatible JS.

## Publish

```bash
eas update --channel preview --message "Describe the fix"
eas update --channel production --message "Describe the fix"
```

Rollback: publish the last known-good update to the same channel (EAS keeps
update ids). Do not invent Expo project ids.

## Critical updates

Set `extra.criticalUpdate` to `true` in `app.config.js` for a publish that
must restart immediately. The app shows: "We've got an important update for
you. Restart Get Along to continue." Normal updates download in the
background and apply on the next cold start. Reload is attempted at most once
per update id.

## Needs a native rebuild

- New or upgraded native modules (Truecaller, AdMob App IDs, SecureStore
  plugin changes that affect native config)
- `app.config.js` plugins, package name, scheme, icons, splash, permissions
- Expo SDK upgrades
- Anything that changes `runtimeVersion`

JS-only screens, copy, and most `/services` changes can ship OTA.
