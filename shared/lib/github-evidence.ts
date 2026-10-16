/** Github public repository URLs only; metadata is not proof of ownership or completion. */
export type PublicRepositoryPointer = { owner: string; repo: string };
export function parsePublicRepositoryUrl(input: string): PublicRepositoryPointer | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com"
      || url.username || url.password || url.port || url.search || url.hash) return null;
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length !== 2) return null;
    const owner = segments[0], repo = segments[1].replace(/\.git$/i, "");
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(owner)
      || !/^[a-z\d_.-]{1,100}$/i.test(repo) || repo === "." || repo === "..") return null;
    return {owner,repo};
  } catch { return null; }
}
