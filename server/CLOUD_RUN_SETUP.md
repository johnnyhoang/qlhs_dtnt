# Cloud Run & Cloud Build Configuration Guide

To ensure the backend works correctly in production, you must configure the following **Substitutions** in your Google Cloud Build Trigger.

## Required Cloud Build Substitutions

Go to **Cloud Build** > **Triggers** > **Edit** your trigger > **Advanced** > **Substitution variables**.

Add the following variables (keys and values):

| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `_DB_PASS` | `your-db-password` | **[CRITICAL]** Logic for database connection. |
| `_JWT_SECRET` | `your-secure-random-string` | **[CRITICAL]** Used for signing auth tokens. |
| `_GOOGLE_CLIENT_ID` | `your-client-id.apps...` | **[CRITICAL]** Google login client ID. |
| `_DB_USER` | `qlhs_user` | Database user (default in yaml: `qlhs_user`). |
| `_DB_NAME` | `qlhs_db` | Database name (default in yaml: `qlhs_db`). |
| `_INSTANCE_CONNECTION_NAME` | `qlhsdtnt:asia-southeast1:qlhs-db-instance` | Cloud SQL Instance Connection Name. |
| `_VITE_API_URL` | `https://...run.app/api` | API URL for the frontend build. |

> [!IMPORTANT]
> The `cloudbuild.yaml` file has been configured to use defaults for non-sensitive values, but you **MUST** provide `_DB_PASS` and `_JWT_SECRET` in the trigger settings to avoid committing secrets to the repository.

## Verification

After updating the trigger:
1.  **Push** a new commit to the watched branch (e.g., `master`).
2.  Go to **Cloud Build** > **History** and watch the build.
3.  Once deployed, go to **Cloud Run** > `qlhs-server` > **Logs** and look for:
    - `Server is listening on port 3500`
    - `Data Source has been initialized!`
