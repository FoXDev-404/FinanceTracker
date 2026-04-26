# Fix Notifications API 401 Unauthorized Errors

## Root Causes
1. No automatic token refresh on 401 - api-service.js just fails when JWT expires
2. Polling continues after 401 - Navbar.js keeps calling API every 30s even when unauthenticated
3. Race condition - AuthContext validates token on mount, but Navbar starts requests before validation completes

## Steps
- [x] Step 1: Update api-service.js with fetchWithAuth wrapper that auto-refreshes tokens on 401
- [x] Step 2: Update Navbar.js to stop polling and redirect to login on 401 errors
- [x] Step 3: Update AuthContext.js to only set isLoggedIn=true after token validation succeeds
- [ ] Step 4: Test the fixes

