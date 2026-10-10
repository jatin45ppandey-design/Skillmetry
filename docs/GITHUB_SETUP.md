# How to publish this starter to GitHub

The project package is prepared locally. The connected GitHub tool in this environment cannot create a new repository. **Do not overwrite an unrelated existing repository.**

## 1. Create the empty repository
- Open https://github.com/new
- Owner: `jatin45ppandey-design` (or another account you control)
- Repository name: `Skillmetry`
- Set visibility to **Private** initially.
- **Do not** add README, .gitignore or license; those files already exist locally.

## 2. Publish project (in unzipped project folder)

```bash
git init -b main
npm install
git add .
git commit -m "chore: bootstrap Skillmetry career digital twin"
git remote add origin https://github.com/jatin45ppandey-design/Skillmetry.git
git push -u origin main
```

You may need a GitHub authenticated CLI/session or personal access token. Do not paste tokens into files or chats.

## 3. Later clone on another machine

```bash
git clone https://github.com/jatin45ppandey-design/Skillmetry.git
cd Skillmetry
npm ci
npm run dev
```

## Alternative connector workflow
After the empty repository exists, provide the URL in ChatGPT. The GitHub connector can write files to an existing accessible repository; ask to upload the Skillmetry starter there. Do **not** push to an unrelated existing project.
