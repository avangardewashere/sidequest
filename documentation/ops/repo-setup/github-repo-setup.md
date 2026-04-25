# GitHub Repository Setup Documentation

> Personal reference for setting up a secure GitHub repository with CI/CD, secrets, and branch protection.

---

## 1. Repository Secrets

**Location:** Repository → Settings → Secrets and Variables → Actions → Secrets tab

### Rules for Secret Names
- Only alphanumeric characters (`a-z`, `A-Z`, `0-9`) and underscores (`_`)
- Must start with a letter or underscore
- No spaces allowed

### Secrets Added

| Secret Name | Description |
|-------------|-------------|
| `AUTH_SECRET` | Strong random string (32+ chars) used for authentication |
| `MONGODB_URI` | MongoDB connection string for test/staging DB (not prod) |

### Generating `AUTH_SECRET`
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 32
```

### `MONGODB_URI` Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```
Get this from: **MongoDB Atlas → Your Cluster → Connect → Drivers**

### How to Add a Secret
1. Go to **Settings → Secrets and Variables → Actions**
2. Click **"New repository secret"**
3. Enter the **Name** and **Value**
4. Click **"Add secret"**

---

## 2. Branch Protection (Ruleset)

**Location:** Repository → Settings → Rules → Rulesets → New branch ruleset

### Configuration

| Field | Value |
|-------|-------|
| Ruleset Name | `main-protection` |
| Enforcement Status | `Active` |
| Target Branch | `main` (via "Include by pattern") |

### Bypass List
- Added **Repository admin** role as a bypass (escape hatch for emergencies)
- Leave empty if you want strict enforcement even for yourself

### Branch Rules Enabled

| Rule | Status | Notes |
|------|--------|-------|
| Restrict deletions | ✅ Enabled | Prevents accidental branch deletion |
| Require pull request before merging | ✅ Enabled | Recommended even solo |
| Require status checks to pass | ✅ Enabled | Blocks merges if CI fails |
| Require branches to be up to date | ✅ Enabled | Ensures latest code is tested |
| Do not require status checks on creation | ✅ Enabled | Allows branch creation freely |

### Required Status Checks Added

| Check Name | Type | Workflow File |
|------------|------|---------------|
| `ci` | Required | `.github/workflows/ci.yml` |
| `e2e` | Optional/Manual | `.github/workflows/e2e.yml` |

> ⚠️ **Note:** Check names must exactly match the `job` name in your `.yml` workflow files. If they don't appear in the dropdown, push a commit first to trigger the workflows, then come back to add them.

### Example Workflow Job Names
```yaml
# .github/workflows/ci.yml
jobs:
  ci:           # ← this is the check name registered in GitHub
    runs-on: ubuntu-latest
    ...

# .github/workflows/e2e.yml
jobs:
  e2e:          # ← this is the check name registered in GitHub
    runs-on: ubuntu-latest
    ...
```

---

## 3. Summary Checklist

- [x] Added `AUTH_SECRET` to repository secrets
- [x] Added `MONGODB_URI` to repository secrets
- [x] Created branch ruleset `main-protection`
- [x] Set target branch to `main`
- [x] Enabled required status checks (`ci`, `e2e`)
- [x] Enabled PR requirement before merging
- [x] Enabled up-to-date branch requirement
- [x] Added Repository admin to bypass list

---

*Last updated: April 2026*
