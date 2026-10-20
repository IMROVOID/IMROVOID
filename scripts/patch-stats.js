const fs = require('fs');
const path = require('path');

function exponential_cdf(x) {
  return 1 - 2 ** -x;
}
function log_normal_cdf(x) {
  return x / (1 + x);
}

function calculateRank({ commits, prs, issues, reviews, stars, followers }) {
  const COMMITS_MEDIAN = 250, COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50, PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25, ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2, REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50, STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 10, FOLLOWERS_WEIGHT = 1;
  const TOTAL_WEIGHT = 12;

  const rank = 1 - (
    COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN) +
    PRS_WEIGHT * exponential_cdf(prs / PRS_MEDIAN) +
    ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN) +
    REVIEWS_WEIGHT * exponential_cdf(reviews / REVIEWS_MEDIAN) +
    STARS_WEIGHT * log_normal_cdf(stars / STARS_MEDIAN) +
    FOLLOWERS_WEIGHT * log_normal_cdf(followers / FOLLOWERS_MEDIAN)
  ) / TOTAL_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
  const level = LEVELS[THRESHOLDS.findIndex((t) => rank * 100 <= t)] || 'B-';
  return { level, percentile: rank * 100 };
}

async function main() {
  const token = process.env.STATS_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('No STATS_TOKEN provided, skipping patch.');
    return;
  }

  const query = `query {
    user(login: "IMROVOID") {
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
        totalPullRequestReviewContributions
      }
      pullRequests { totalCount }
      issues { totalCount }
      repositories(first: 100, ownerAffiliations: OWNER) {
        nodes {
          stargazers { totalCount }
        }
      }
      followers { totalCount }
    }
  }`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'User-Agent': 'Node',
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  if (!json.data || !json.data.user) {
    console.error('GraphQL query failed:', json);
    return;
  }

  const user = json.data.user;
  const publicCommits = user.contributionsCollection.totalCommitContributions;
  const privateContributions = user.contributionsCollection.restrictedContributionsCount || 0;
  const totalCommits = publicCommits + privateContributions;
  const prs = user.pullRequests.totalCount;
  const issues = user.issues.totalCount;
  const reviews = user.contributionsCollection.totalPullRequestReviewContributions || 0;
  const stars = user.repositories.nodes.reduce((acc, r) => acc + (r.stargazers?.totalCount || 0), 0);
  const followers = user.followers.totalCount;

  console.log(`Public commits: ${publicCommits}, Private contributions: ${privateContributions}, Total: ${totalCommits}`);

  const { level, percentile } = calculateRank({
    commits: totalCommits,
    prs,
    issues,
    reviews,
    stars,
    followers
  });

  const targetOffset = (251.32741228718345 * (percentile / 100)).toFixed(14);

  const svgPath = path.join(__dirname, '..', 'assets', 'stats.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('assets/stats.svg does not exist');
    return;
  }

  let svg = fs.readFileSync(svgPath, 'utf8');

  // 1. Update commits number
  svg = svg.replace(/(data-testid="commits"[^>]*>)\d+(<\/text>)/, `$1${totalCommits}$2`);

  // 2. Update desc
  svg = svg.replace(/Total Commits\s*\(last year\)\s*:\s*\d+/, `Total Commits (last year): ${totalCommits}`);

  // 3. Update title
  svg = svg.replace(/(Rank:\s*)[A-Z\+\-]+/, `$1${level}`);

  // 4. Update rank badge text
  svg = svg.replace(/(data-testid="level-rank-icon">\s*)[A-Z\+\-]+(\s*<\/text>)/, `$1${level}$2`);

  // 5. Update animation stroke-dashoffset
  svg = svg.replace(/(to\s*\{\s*stroke-dashoffset:\s*)[\d\.]+(;\s*\})/, `$1${targetOffset}$2`);

  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log(`Successfully patched assets/stats.svg with totalCommits=${totalCommits}, rank=${level}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
