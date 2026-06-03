#!/usr/bin/env bash
# Run after every `npx cap sync ios` to place Apple-required files.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
IOS_APP="$REPO_ROOT/ios/App/App"

echo "==> Copying PrivacyInfo.xcprivacy …"
cp "$SCRIPT_DIR/PrivacyInfo.xcprivacy" "$IOS_APP/PrivacyInfo.xcprivacy"
echo "    ✓ $IOS_APP/PrivacyInfo.xcprivacy"

echo ""
echo "==> Done. Open Xcode and verify PrivacyInfo.xcprivacy is listed"
echo "    under App/App in the project navigator (add it if missing)."
