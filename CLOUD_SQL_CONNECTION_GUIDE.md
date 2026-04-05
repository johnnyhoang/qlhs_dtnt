# Supabase Connection Guide

This project no longer uses MySQL or Cloud SQL.

Database access is done through Supabase PostgreSQL using `DATABASE_URL`.

## Required Server Environment

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:6543/postgres?pgbouncer=true
```

## Notes

- Supabase pooler URLs commonly use port `6543`
- The backend already enables SSL automatically when the URL contains `supabase.com`
- `INSTANCE_CONNECTION_NAME`, socket paths, and Cloud SQL roles are not used by the current app

## Health Checklist

If the API cannot connect to the database:
1. Verify `DATABASE_URL` is present in the deployed server environment
2. Verify the password and host are correct
3. Verify Supabase project network rules still allow the connection
4. Redeploy the server after changing env vars
