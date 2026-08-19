# Frontend Production Verification

Last verified: 2026-08-18

## Result

The static site currently served by `https://alphatrack.digital` is an exact build of website commit `45043ef7b62890f5b8d0057eeef473e4610af44e` (`fix(admin): exclude support chat widget from admin console`) using the public production endpoint configuration. Confidence is **high** because the prerendered homepage and seven critical assets matched the isolated candidate build byte-for-byte by SHA-256.

The live site is not the current repository tip `main@38f280d0b99a10678de455dac16a671f431d372c`. Commit `45043ef7` is an ancestor of `38f280d0`; the later merge adds the protected cPanel publishing workflow and subsequent production, prerender, local-font, SEO, legal, static-file and hydration changes.

## Evidence

- Protected workflow run `31539884737` successfully deployed `main@4fdcec59a62bb347187764e0e847622e3e60f173` on 2026-08-11. Its build, cPanel activation, GET-only smoke and IndexNow steps all completed successfully.
- The current public HTML and assets do not match that retained workflow artifact, proving the public files changed after the protected release.
- Isolated builds were made from exact Git trees without changing the working checkout or any hosting platform.
- Rebuilding `45043ef7` reproduced all live filenames and hashes below.

| Public file | SHA-256 | Result |
| --- | --- | --- |
| Prerendered `/` HTML | Recorded in the local comparison; 164,538 bytes on both sides | Exact byte match |
| `/assets/index-HbX5w1An.js` | `07e200fecbe6b0ce1c4cc6e1d10284c1b03bdda81a72fb56d961b3522056bd8e` | Exact byte match |
| `/assets/index-BsKRnpiV.css` | `ae9629e374ea49d51b90d0a89cf536403067718e7ff5204debcd5007b0cb52ba` | Exact byte match |
| `/assets/microsoft-clarity-kT2OK1-C.ico` | `03b31a3dddfd3c3326367224de30caa24597e9250752cc6d7e99b61302ce1e31` | Exact byte match |
| `/assets/AdminLogin-Ch0ql2-I.js` | `f72bd329a2bfdc1fcd8f69e2d6fc9e673f217d20277c4bf1225982065231dfc1` | Exact byte match |
| `/assets/AdminLayout-C4KJr3Vf.js` | `39606cc6bc9183a293dc2062e2948b3bb269208b3ab9ae9392f06df3ab03ebd3` | Exact byte match |
| `/assets/AdminBlog-p5s0MVj9.js` | `3826486d0498f5830cacbec18ef424f3865a551bd73db1fe8d831fb5e3d1232a` | Exact byte match |
| `/assets/AdminContacts-vZy1jmJm.js` | `436d9880ef50db75c6a0736cb9319a98bf4a0aed2eec1bb69e8dee9fafd4cd16` | Exact byte match |

The build used only public values already embedded in the live bundle: the `alphatra-serv.netlify.app` frontend API endpoints and `https://alphatrack.digital` site URL. No secret was read or recorded.

## Public Smoke

The repository's GET-only production smoke suite passed on 2026-08-18 for the homepage, Tracking Audit offer, Privacy Policy, Cookie Policy, Terms of Service, sitemap, and custom 404 route. Critical JavaScript, CSS, icon and admin chunks returned `200` during fingerprinting. No form, login, webhook or other mutating request was sent.

## Decision and Next Action

- Treat `45043ef7` as the verified current cPanel production frontend until a later release is evidenced.
- Do not describe `main@38f280d0` as live yet.
- Review the `45043ef7..38f280d0` production delta, then use the protected `Release public website` workflow for any approved update. Avoid another undocumented manual cPanel upload.
- Add a small public release marker in a future approved release so subsequent verification does not require asset reconstruction.
