# studio 2.5 advisor — deployment guide

## what this is
A Next.js application for advisor.studio25.xyz — executive intelligence for infrastructure AI transformation. Powered by Tavily search + Claude synthesis + Clerk authentication.

## stack
- **Next.js 14** — framework
- **Vercel** — deployment
- **Clerk** — authentication
- **Anthropic Claude** — synthesis
- **Tavily** — real-time search

---

## deployment steps

### 1. push to GitHub
Create a new repository on github.com and push this folder:
```
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/studio25-advisor.git
git push -u origin main
```

### 2. deploy to Vercel
- Go to vercel.com → New Project
- Import your GitHub repository
- Framework: Next.js (auto-detected)
- Click Deploy (it will fail first time — you need env vars)

### 3. add environment variables in Vercel
Go to your project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    (from clerk.com → API Keys)
CLERK_SECRET_KEY                     (from clerk.com → API Keys)
NEXT_PUBLIC_CLERK_SIGN_IN_URL        /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL        /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL  /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL  /dashboard
ANTHROPIC_API_KEY                    (from console.anthropic.com)
TAVILY_API_KEY                       (from app.tavily.com)
```

Then redeploy.

### 4. add custom domain
- Vercel → project → Settings → Domains
- Add: advisor.studio25.xyz
- In Cloudflare DNS, add a CNAME record:
  - Name: advisor
  - Target: cname.vercel-dns.com
  - Proxy: DNS only (grey cloud)

### 5. configure Clerk
- Go to clerk.com → your application → Domains
- Add advisor.studio25.xyz as a production domain
- Update allowed redirect URLs to include your domain

---

## getting your API keys

**Clerk keys:**
clerk.com → your application → API Keys → copy Publishable Key and Secret Key

**Anthropic key:**
console.anthropic.com → Settings → API Keys → Create Key

**Tavily key:**
app.tavily.com → API Keys → copy key

---

## local development
```
cp .env.local.example .env.local
# fill in your keys
npm install
npm run dev
# open http://localhost:3000
```
